from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from memory.store import knowledge_store

logger = logging.getLogger(__name__)


class KnowledgeMemory:
    """
    Manages a persistent knowledge base stored in the vector store.

    Knowledge items are chunks of text with provenance metadata
    (source, timestamp, etc.).  They are retrieved semantically by
    the agents to augment responses with relevant context.
    """

    def add_knowledge(
        self,
        content: str,
        source: str,
        metadata: dict[str, Any] | None = None,
    ) -> str:
        """
        Index a piece of knowledge.

        Args:
            content: The text to store.
            source:  Where this text came from (e.g. "notion:page_id", "manual").
            metadata: Any extra metadata to attach.

        Returns:
            The document id assigned to this knowledge item.
        """
        doc_id = str(uuid.uuid4())
        combined_meta: dict[str, Any] = {
            "source": source,
            "indexed_at": datetime.now(timezone.utc).isoformat(),
        }
        if metadata:
            combined_meta.update(metadata)

        knowledge_store.add(text=content, metadata=combined_meta, doc_id=doc_id)
        logger.debug("Indexed knowledge item %s from %s", doc_id, source)
        return doc_id

    def search_knowledge(
        self, query: str, n_results: int = 5
    ) -> list[dict[str, Any]]:
        """
        Retrieve the most semantically relevant knowledge items.

        Returns a list of dicts with keys: id, text, metadata, score.
        """
        return knowledge_store.search(query, n_results=n_results)

    def delete_knowledge(self, doc_id: str) -> None:
        """Remove a knowledge item by its id."""
        knowledge_store.delete(doc_id)


# Module-level singleton
knowledge_memory = KnowledgeMemory()
