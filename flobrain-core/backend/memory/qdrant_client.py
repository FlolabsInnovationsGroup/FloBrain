"""memory/qdrant_client.py — Qdrant wrapper with ChromaDB-compatible API.

Drop-in replacement for chromadb PersistentClient.collection.
Provides: add(ids, embeddings, metadatas), query(query_embeddings, n_results, where),
delete(ids), count(), get(limit, include, where).

Configuration:
    QDRANT_URL — e.g. http://qdrant:6333 (env var)
    QDRANT_COLLECTION — collection name (default: flobrain_associative_memory)
    QDRANT_VECTOR_SIZE — embedding dimension (default: 384)
"""
import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant:6333")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "flobrain_associative_memory")
QDRANT_VECTOR_SIZE = int(os.getenv("QDRANT_VECTOR_SIZE", "384"))

try:
    from qdrant_client import QdrantClient as _QdrantClient
    from qdrant_client.http import models as qmodels
    QDRANT_AVAILABLE = True
except ImportError:
    logger.warning("[QdrantClient] qdrant-client not installed; using stub")
    _QdrantClient = None
    QDRANT_AVAILABLE = False


class QdrantCollection:
    """ChromaDB-compatible wrapper around Qdrant client."""

    def __init__(self, url: str = QDRANT_URL, collection_name: str = QDRANT_COLLECTION,
                 vector_size: int = QDRANT_VECTOR_SIZE):
        self.collection_name = collection_name
        self.vector_size = vector_size
        self._client = None
        if QDRANT_AVAILABLE:
            try:
                self._client = _QdrantClient(url=url, timeout=10)
                self._ensure_collection()
                logger.info(f"[QdrantClient] Connected to {url}, collection={collection_name}")
            except Exception as e:
                logger.error(f"[QdrantClient] Connection failed: {e}")
                self._client = None

    def _ensure_collection(self):
        if not self._client:
            return
        try:
            self._client.get_collection(self.collection_name)
        except Exception:
            self._client.recreate_collection(
                collection_name=self.collection_name,
                vectors_config=qmodels.VectorConfig(
                    size=self.vector_size,
                    distance=qmodels.Distance.COSINE,
                ),
            )
            logger.info(f"[QdrantClient] Created collection {self.collection_name}")

    def add(self, ids: List[str], embeddings: List[List[float]],
            metadatas: Optional[List[Dict[str, Any]]] = None):
        if not self._client:
            return
        points = []
        for i, (pid, vec) in enumerate(zip(ids, embeddings)):
            payload = metadatas[i] if metadatas and i < len(metadatas) else {}
            points.append(qmodels.PointStruct(id=pid, vector=vec, payload=payload))
        self._client.upsert(collection_name=self.collection_name, points=points)

    def upsert(self, ids: List[str], embeddings: List[List[float]],
               metadatas: Optional[List[Dict[str, Any]]] = None):
        self.add(ids, embeddings, metadatas)

    def query(self, query_embeddings: List[List[float]], n_results: int = 10,
              where: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self._client:
            return {"ids": [[]], "distances": [[]], "metadatas": [[]]}
        try:
            must_filters = []
            if where:
                for k, v in where.items():
                    must_filters.append(qmodels.FieldCondition(
                        key=k, match=qmodels.MatchValue(value=v)
                    ))
            query_filter = qmodels.Filter(must=must_filters) if must_filters else None

            results = self._client.search(
                collection_name=self.collection_name,
                query_vector=query_embeddings[0],
                limit=n_results,
                query_filter=query_filter,
                with_payload=True,
            )
            ids = [[str(p.id) for p in results]]
            distances = [[p.score for p in results]]
            metadatas = [[p.payload for p in results]]
            return {"ids": ids, "distances": distances, "metadatas": metadatas}
        except Exception as e:
            logger.error(f"[QdrantClient] query failed: {e}")
            return {"ids": [[]], "distances": [[]], "metadatas": [[]]}

    def get(self, limit: int = 10, include: Optional[List[str]] = None,
            where: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self._client:
            return {"ids": [], "metadatas": []}
        try:
            must_filters = []
            if where:
                for k, v in where.items():
                    must_filters.append(qmodels.FieldCondition(
                        key=k, match=qmodels.MatchValue(value=v)
                    ))
            query_filter = qmodels.Filter(must=must_filters) if must_filters else None
            scroll_result = self._client.scroll(
                collection_name=self.collection_name,
                limit=limit,
                query_filter=query_filter,
                with_payload=True,
                with_vectors=False,
            )
            points, _ = scroll_result
            return {
                "ids": [str(p.id) for p in points],
                "metadatas": [p.payload for p in points],
            }
        except Exception as e:
            logger.error(f"[QdrantClient] get failed: {e}")
            return {"ids": [], "metadatas": []}

    def delete(self, ids: Optional[List[str]] = None, where: Optional[Dict[str, Any]] = None):
        if not self._client:
            return
        try:
            if ids:
                self._client.delete(
                    collection_name=self.collection_name,
                    points_selector=qmodels.PointIdsList(points=ids),
                )
            elif where:
                must_filters = []
                for k, v in where.items():
                    must_filters.append(qmodels.FieldCondition(
                        key=k, match=qmodels.MatchValue(value=v)
                    ))
                self._client.delete(
                    collection_name=self.collection_name,
                    points_selector=qmodels.FilterSelector(
                        filter=qmodels.Filter(must=must_filters)
                    ),
                )
        except Exception as e:
            logger.error(f"[QdrantClient] delete failed: {e}")

    def count(self) -> int:
        if not self._client:
            return 0
        try:
            result = self._client.count(collection_name=self.collection_name, exact=True)
            return result.count
        except Exception:
            return 0


def get_collection() -> QdrantCollection:
    return QdrantCollection()
