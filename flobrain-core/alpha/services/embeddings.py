from __future__ import annotations

import hashlib
import logging
import math
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Optional: sentence-transformers
# ---------------------------------------------------------------------------
try:
    from sentence_transformers import SentenceTransformer  # type: ignore

    _SENTENCE_TRANSFORMERS_AVAILABLE = True
    logger.info("sentence-transformers is available; using neural embeddings.")
except ImportError:
    _SENTENCE_TRANSFORMERS_AVAILABLE = False
    logger.warning(
        "sentence-transformers not installed. "
        "Falling back to hash-based embeddings (not suitable for production)."
    )


# ---------------------------------------------------------------------------
# Fallback: deterministic hash-based embeddings
# ---------------------------------------------------------------------------

_HASH_DIM = 384  # same dimension as all-MiniLM-L6-v2 for compatibility


def _hash_embed(text: str, dim: int = _HASH_DIM) -> list[float]:
    """
    Produce a deterministic pseudo-embedding from a SHA-256 hash of the text.
    NOT semantically meaningful — used only as a graceful fallback.
    """
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    # Expand to `dim` floats in [-1, 1]
    seed_bytes = (digest * math.ceil(dim * 4 / len(digest)))[: dim * 4]
    floats: list[float] = []
    for i in range(dim):
        chunk = seed_bytes[i * 4 : i * 4 + 4]
        val = int.from_bytes(chunk, "big", signed=True) / (2**31)
        floats.append(val)
    # L2-normalise
    norm = math.sqrt(sum(f * f for f in floats)) or 1.0
    return [f / norm for f in floats]


# ---------------------------------------------------------------------------
# EmbeddingsService
# ---------------------------------------------------------------------------


class EmbeddingsService:
    """
    Wraps sentence-transformers when available; falls back to hash embeddings.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2") -> None:
        self._model: Any = None
        self._using_neural = False

        if _SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                self._model = SentenceTransformer(model_name)
                self._using_neural = True
                logger.info("Loaded embedding model: %s", model_name)
            except Exception as exc:
                logger.warning("Failed to load embedding model %s: %s. Using hash fallback.", model_name, exc)

    @property
    def is_neural(self) -> bool:
        return self._using_neural

    def embed(self, text: str) -> list[float]:
        """Embed a single piece of text."""
        if self._using_neural and self._model is not None:
            vec = self._model.encode(text, normalize_embeddings=True)
            return vec.tolist()
        return _hash_embed(text)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Embed multiple texts in one call."""
        if self._using_neural and self._model is not None:
            vecs = self._model.encode(texts, normalize_embeddings=True, batch_size=32)
            return [v.tolist() for v in vecs]
        return [_hash_embed(t) for t in texts]


# Module-level singleton
embeddings_service = EmbeddingsService()
