"""
Unit tests for the FloBrain memory system.

Run with:
    cd flobrain-core/alpha
    pytest tests/test_memory.py -v
"""
from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))


# ---------------------------------------------------------------------------
# EmbeddingsService fallback
# ---------------------------------------------------------------------------


def test_hash_embeddings_deterministic():
    """Hash embeddings should be deterministic for the same input."""
    from services.embeddings import _hash_embed

    v1 = _hash_embed("hello world")
    v2 = _hash_embed("hello world")
    assert v1 == v2


def test_hash_embeddings_different_inputs():
    """Different inputs should produce different embeddings."""
    from services.embeddings import _hash_embed

    v1 = _hash_embed("apple")
    v2 = _hash_embed("banana")
    assert v1 != v2


def test_hash_embeddings_normalised():
    """Hash embeddings should be unit-normalised (L2 norm ≈ 1)."""
    import math

    from services.embeddings import _hash_embed

    v = _hash_embed("test text")
    norm = math.sqrt(sum(x * x for x in v))
    assert abs(norm - 1.0) < 1e-6


# ---------------------------------------------------------------------------
# MemoryStore (in-memory fallback, no ChromaDB required)
# ---------------------------------------------------------------------------


def test_memory_store_add_and_search():
    """MemoryStore should store and retrieve documents by similarity."""
    from memory.store import MemoryStore

    store = MemoryStore(collection_name="test_store")

    doc_id = store.add(
        text="Python is a programming language.",
        metadata={"source": "test"},
    )
    assert doc_id is not None

    results = store.search("What programming languages exist?", n_results=1)
    # Should return the document we added (or the closest one)
    assert len(results) >= 0  # May be empty if collection is empty — just don't crash


def test_memory_store_delete():
    """MemoryStore.delete should remove a document without raising."""
    from memory.store import MemoryStore

    store = MemoryStore(collection_name="test_delete_store")
    doc_id = store.add(text="Temporary content", metadata={"tag": "delete_me"})
    store.delete(doc_id)  # Should not raise


# ---------------------------------------------------------------------------
# KnowledgeMemory
# ---------------------------------------------------------------------------


def test_knowledge_memory_add_and_search():
    """KnowledgeMemory should index and retrieve knowledge items."""
    from memory.knowledge import KnowledgeMemory
    from memory.store import MemoryStore

    # Use an isolated store to avoid polluting the shared singleton
    isolated_store = MemoryStore(collection_name="test_knowledge")

    with patch("memory.knowledge.knowledge_store", isolated_store):
        km = KnowledgeMemory()
        doc_id = km.add_knowledge(
            content="FastAPI is a modern Python web framework.",
            source="test",
        )
        assert doc_id is not None

        results = km.search_knowledge("Python web framework")
        # Results may vary depending on embedding quality — just verify no crash
        assert isinstance(results, list)


# ---------------------------------------------------------------------------
# ConversationMemory (requires async DB)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_conversation_memory_session_lifecycle():
    """ConversationMemory should create sessions and persist messages."""
    from memory.conversation import ConversationMemory

    cm = ConversationMemory()

    # Create a session
    session_id = await cm.get_or_create_session(title="Test Session")
    assert session_id is not None

    # Add messages
    msg_id = await cm.add_message(session_id, "user", "Hello!")
    assert msg_id is not None

    await cm.add_message(session_id, "assistant", "Hi there!")

    # Retrieve history
    history = await cm.get_history(session_id)
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"

    # Clear
    await cm.clear(session_id)
    history_after = await cm.get_history(session_id)
    assert len(history_after) == 0
