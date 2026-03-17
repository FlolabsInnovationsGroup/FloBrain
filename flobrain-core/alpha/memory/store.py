from __future__ import annotations

import logging
import uuid
from pathlib import Path
from typing import Any

from config.settings import settings
from services.embeddings import embeddings_service

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Optional: ChromaDB
# ---------------------------------------------------------------------------
try:
    import chromadb  # type: ignore
    from chromadb.config import Settings as ChromaSettings  # type: ignore

    _CHROMADB_AVAILABLE = True
    logger.info("ChromaDB is available.")
except ImportError:
    _CHROMADB_AVAILABLE = False
    logger.warning(
        "ChromaDB not installed. Falling back to in-memory dict store "
        "(data will not persist across restarts)."
    )


# ---------------------------------------------------------------------------
# In-memory fallback store
# ---------------------------------------------------------------------------


class _InMemoryStore:
    """Minimal in-memory vector store used when ChromaDB is not available."""

    def __init__(self) -> None:
        self._docs: dict[str, dict[str, Any]] = {}

    def add(self, text: str, metadata: dict, doc_id: str) -> str:
        embedding = embeddings_service.embed(text)
        self._docs[doc_id] = {
            "id": doc_id,
            "text": text,
            "embedding": embedding,
            "metadata": metadata,
        }
        return doc_id

    def search(self, query: str, n_results: int = 5) -> list[dict[str, Any]]:
        if not self._docs:
            return []
        query_vec = embeddings_service.embed(query)
        scored: list[tuple[float, dict]] = []
        for doc in self._docs.values():
            score = _cosine_similarity(query_vec, doc["embedding"])
            scored.append((score, doc))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [
            {"id": d["id"], "text": d["text"], "metadata": d["metadata"], "score": s}
            for s, d in scored[:n_results]
        ]

    def delete(self, doc_id: str) -> None:
        self._docs.pop(doc_id, None)


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(x * x for x in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


# ---------------------------------------------------------------------------
# MemoryStore
# ---------------------------------------------------------------------------


class MemoryStore:
    """
    Unified interface over ChromaDB (when available) or an in-memory fallback.
    """

    def __init__(self, collection_name: str = "flobrain_memory") -> None:
        self._collection_name = collection_name
        self._chroma_collection: Any = None
        self._fallback: _InMemoryStore | None = None
        self._using_chroma = False
        self._initialized = False

    def _init(self) -> None:
        if self._initialized:
            return
        self._initialized = True

        if _CHROMADB_AVAILABLE:
            try:
                chroma_path = settings.CHROMADB_PATH
                Path(chroma_path).mkdir(parents=True, exist_ok=True)
                client = chromadb.PersistentClient(
                    path=chroma_path,
                    settings=ChromaSettings(anonymized_telemetry=False),
                )
                self._chroma_collection = client.get_or_create_collection(
                    name=self._collection_name,
                    metadata={"hnsw:space": "cosine"},
                )
                self._using_chroma = True
                logger.info("ChromaDB collection '%s' ready.", self._collection_name)
            except Exception as exc:
                logger.warning("ChromaDB init failed: %s. Using in-memory fallback.", exc)
                self._fallback = _InMemoryStore()
        else:
            self._fallback = _InMemoryStore()

    @property
    def is_persistent(self) -> bool:
        self._init()
        return self._using_chroma

    def add(self, text: str, metadata: dict, doc_id: str | None = None) -> str:
        self._init()
        if doc_id is None:
            doc_id = str(uuid.uuid4())

        if self._using_chroma and self._chroma_collection is not None:
            embedding = embeddings_service.embed(text)
            self._chroma_collection.upsert(
                ids=[doc_id],
                documents=[text],
                embeddings=[embedding],
                metadatas=[metadata],
            )
        else:
            assert self._fallback is not None
            self._fallback.add(text, metadata, doc_id)

        return doc_id

    def search(self, query: str, n_results: int = 5) -> list[dict[str, Any]]:
        self._init()

        if self._using_chroma and self._chroma_collection is not None:
            embedding = embeddings_service.embed(query)
            results = self._chroma_collection.query(
                query_embeddings=[embedding],
                n_results=min(n_results, self._chroma_collection.count() or 1),
                include=["documents", "metadatas", "distances"],
            )
            output: list[dict] = []
            ids = results.get("ids", [[]])[0]
            docs = results.get("documents", [[]])[0]
            metas = results.get("metadatas", [[]])[0]
            dists = results.get("distances", [[]])[0]
            for rid, doc, meta, dist in zip(ids, docs, metas, dists):
                output.append(
                    {"id": rid, "text": doc, "metadata": meta, "score": 1.0 - dist}
                )
            return output

        assert self._fallback is not None
        return self._fallback.search(query, n_results)

    def delete(self, doc_id: str) -> None:
        self._init()
        if self._using_chroma and self._chroma_collection is not None:
            self._chroma_collection.delete(ids=[doc_id])
        elif self._fallback is not None:
            self._fallback.delete(doc_id)

    def get_by_id(self, doc_id: str) -> dict[str, Any] | None:
        """Fetch a single document by its id, or None if not found."""
        self._init()
        if self._using_chroma and self._chroma_collection is not None:
            try:
                result = self._chroma_collection.get(
                    ids=[doc_id],
                    include=["documents", "metadatas"],
                )
                ids = result.get("ids", [])
                if not ids:
                    return None
                docs = result.get("documents") or [[]]
                metas = result.get("metadatas") or [[]]
                return {
                    "id": ids[0],
                    "text": docs[0] if docs else "",
                    "metadata": metas[0] if metas else {},
                }
            except Exception:
                return None
        elif self._fallback is not None:
            doc = self._fallback._docs.get(doc_id)
            if doc:
                return {"id": doc["id"], "text": doc["text"], "metadata": doc["metadata"]}
        return None


# Module-level singletons for different namespaces
memory_store = MemoryStore(collection_name="flobrain_memory")
knowledge_store = MemoryStore(collection_name="flobrain_knowledge")
