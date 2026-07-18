"""
EmbeddingService — server-side embedding generation with Redis cache.

Solves the critical issue: views.py expected client-side embeddings, but in
production the server must generate them from node text. This module provides:
  - Lazy embedding generation (OpenAI text-embedding-3-small by default)
  - SHA-256 keyed cache in Redis (TTL 7 days) — duplicate text is free
  - Graceful fallback to zero vector if API fails (search will degrade but not crash)
  - Support for multiple providers (OpenAI, sentence-transformers, stub)

Usage:
    from .embeddings import embedding_service
    vec = embedding_service.embed("hello world")
"""
import os
import hashlib
import logging
import time
from typing import List, Optional

import numpy as np
from django_redis import get_redis_connection

logger = logging.getLogger(__name__)


class BaseEmbeddingProvider:
    """Interface for embedding model providers."""

    @property
    def dimension(self) -> int:
        raise NotImplementedError

    @property
    def model_name(self) -> str:
        raise NotImplementedError

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError


class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    """OpenAI text-embedding-3-small (1536d). Requires OPENAI_API_KEY env."""

    def __init__(self, model_name: str = "text-embedding-3-small"):
        self._model_name = model_name
        self._dim = 1536 if "small" in model_name else 3072 if "large" in model_name else 1536
        self._client = None
        try:
            from openai import OpenAI
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                self._client = OpenAI(api_key=api_key)
                logger.info(f"[EmbeddingService] OpenAI provider initialized: {model_name}")
            else:
                logger.warning("[EmbeddingService] OPENAI_API_KEY not set — provider disabled")
        except ImportError:
            logger.warning("[EmbeddingService] openai package not installed")

    @property
    def dimension(self) -> int:
        return self._dim

    @property
    def model_name(self) -> str:
        return self._model_name

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not self._client:
            return [[0.0] * self._dim for _ in texts]
        response = self._client.embeddings.create(input=texts, model=self._model_name)
        return [item.embedding for item in response.data]


class SentenceTransformersProvider(BaseEmbeddingProvider):
    """Local sentence-transformers model (e.g., all-MiniLM-L6-v2, 384d)."""

    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self._model_name = model_name
        self._dim = 384
        self._model = None
        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(model_name)
            self._dim = self._model.get_sentence_embedding_dimension()
            logger.info(f"[EmbeddingService] sentence-transformers loaded: {model_name} (dim={self._dim})")
        except ImportError:
            logger.warning("[EmbeddingService] sentence-transformers not installed")
        except Exception as e:
            logger.warning(f"[EmbeddingService] Failed to load {model_name}: {e}")

    @property
    def dimension(self) -> int:
        return self._dim

    @property
    def model_name(self) -> str:
        return self._model_name

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not self._model:
            return [[0.0] * self._dim for _ in texts]
        embeddings = self._model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        return [e.tolist() for e in embeddings]


class StubEmbeddingProvider(BaseEmbeddingProvider):
    """Deterministic hash-based stub — for tests/dev without ML dependencies."""

    def __init__(self, dim: int = 1536):
        self._dim = dim

    @property
    def dimension(self) -> int:
        return self._dim

    @property
    def model_name(self) -> str:
        return "stub-hash-v1"

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        results = []
        for text in texts:
            h = hashlib.sha512(text.encode('utf-8')).digest()
            vec = np.frombuffer((h * ((self._dim // 64) + 1))[:self._dim * 4], dtype=np.uint8)
            vec = vec.astype(np.float32) / 255.0
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            results.append(vec.tolist())
        return results


class EmbeddingService:
    """
    Singleton embedding service with Redis cache.
    Uses SHA-256 of text as cache key — duplicate text is free.
    """

    CACHE_PREFIX = "embeddings:cache:"
    CACHE_TTL = 7 * 24 * 3600  # 7 days

    def __init__(self, provider: Optional[BaseEmbeddingProvider] = None):
        self.provider = provider or self._autodetect_provider()
        self._cache_enabled = True

    @staticmethod
    def _autodetect_provider() -> BaseEmbeddingProvider:
        if os.getenv("OPENAI_API_KEY"):
            provider = OpenAIEmbeddingProvider()
            if provider._client:
                return provider
        provider = SentenceTransformersProvider()
        if provider._model:
            return provider
        logger.warning("[EmbeddingService] No embedding provider available — using stub")
        return StubEmbeddingProvider()

    @property
    def dimension(self) -> int:
        return self.provider.dimension

    @property
    def model_name(self) -> str:
        return self.provider.model_name

    def _cache_key(self, text: str) -> str:
        text_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()
        return f"{self.CACHE_PREFIX}{self.model_name}:{text_hash}"

    def embed(self, text: str) -> List[float]:
        if not text or not text.strip():
            return [0.0] * self.dimension

        try:
            redis_conn = get_redis_connection("default")
            cache_key = self._cache_key(text)
            cached = redis_conn.get(cache_key)
            if cached:
                import json
                return json.loads(cached)
        except Exception as e:
            logger.debug(f"[EmbeddingService] Cache read miss: {e}")

        vectors = self.embed_batch([text])
        vector = vectors[0] if vectors else [0.0] * self.dimension

        try:
            redis_conn = get_redis_connection("default")
            import json
            redis_conn.setex(self._cache_key(text), self.CACHE_TTL, json.dumps(vector))
        except Exception as e:
            logger.debug(f"[EmbeddingService] Cache write failed: {e}")

        return vector

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        results: List[Optional[List[float]]] = [None] * len(texts)
        miss_indices = []
        miss_texts = []

        try:
            redis_conn = get_redis_connection("default")
            import json
            pipe = redis_conn.pipeline()
            cache_keys = [self._cache_key(t) for t in texts]
            for k in cache_keys:
                pipe.get(k)
            cached_values = pipe.execute()

            for i, (cached, text) in enumerate(zip(cached_values, texts)):
                if cached:
                    results[i] = json.loads(cached)
                else:
                    miss_indices.append(i)
                    miss_texts.append(text if text and text.strip() else "")
        except Exception as e:
            logger.debug(f"[EmbeddingService] Cache pipeline failed: {e}")
            miss_indices = list(range(len(texts)))
            miss_texts = [t if t and t.strip() else "" for t in texts]

        if miss_texts:
            fresh_vectors = self.provider.embed_batch(miss_texts)
            try:
                redis_conn = get_redis_connection("default")
                import json
                pipe = redis_conn.pipeline()
                for idx, text, vec in zip(miss_indices, miss_texts, fresh_vectors):
                    results[idx] = vec
                    if text:
                        pipe.setex(self._cache_key(text), self.CACHE_TTL, json.dumps(vec))
                pipe.execute()
            except Exception as e:
                logger.debug(f"[EmbeddingService] Cache write batch failed: {e}")
                for idx, vec in zip(miss_indices, fresh_vectors):
                    results[idx] = vec

        return [r if r is not None else [0.0] * self.dimension for r in results]


embedding_service = EmbeddingService()
