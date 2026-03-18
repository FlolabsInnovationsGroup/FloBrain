"""Tests for memory/universal.py — UniversalMemoryService."""
from __future__ import annotations

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch, call

from memory.universal import (
    UniversalMemoryService,
    MemoryType,
    ConfirmationState,
    MemoryObject,
)
from memory.events import (
    MEMORY_CREATED,
    MEMORY_CONFIRMED,
    MEMORY_REJECTED,
    MEMORY_PROMOTED,
    MEMORY_DEMOTED,
    MEMORY_EXPIRED,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_doc(doc_id: str, text: str = "some fact", extra_meta: dict | None = None) -> dict:
    meta = {
        "namespace": "user_memory:user1",
        "memory_type": MemoryType.SEMANTIC.value,
        "importance_score": 0.5,
        "confirmation_state": "pending",
        "tags": "[]",
        "extracted_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": None,
        "source": "chat",
    }
    if extra_meta:
        meta.update(extra_meta)
    return {"id": doc_id, "text": text, "metadata": meta}


# ---------------------------------------------------------------------------
# test_create_returns_memory_object
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_returns_memory_object():
    svc = UniversalMemoryService()
    with (
        patch("memory.universal.knowledge_store") as mock_ks,
        patch("memory.universal.memory_event_store") as mock_es,
    ):
        mock_es.append = AsyncMock()
        obj = await svc.create(
            text="User likes Python",
            memory_type=MemoryType.PREFERENCE,
            actor="agent",
            user_id="user1",
            session_id="sess1",
        )
    assert isinstance(obj, MemoryObject)
    assert obj.memory_type == MemoryType.PREFERENCE
    assert obj.text == "User likes Python"
    assert obj.user_id == "user1"


# ---------------------------------------------------------------------------
# test_create_emits_MEMORY_CREATED_event
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_emits_MEMORY_CREATED_event():
    svc = UniversalMemoryService()
    with (
        patch("memory.universal.knowledge_store"),
        patch("memory.universal.memory_event_store") as mock_es,
    ):
        mock_es.append = AsyncMock()
        obj = await svc.create(
            text="Test fact",
            memory_type=MemoryType.SEMANTIC,
            actor="agent",
            user_id="user1",
        )
    mock_es.append.assert_called_once()
    args = mock_es.append.call_args[0]
    assert args[0] == obj.id
    assert args[1] == MEMORY_CREATED
    assert args[2] == "agent"


# ---------------------------------------------------------------------------
# test_confirm_emits_MEMORY_CONFIRMED
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_confirm_emits_MEMORY_CONFIRMED():
    svc = UniversalMemoryService()
    doc = _make_doc("mem-123")
    with (
        patch("memory.universal.knowledge_store") as mock_ks,
        patch("memory.universal.memory_event_store") as mock_es,
    ):
        mock_ks.get_by_id.return_value = doc
        mock_es.append = AsyncMock()
        await svc.confirm("mem-123", actor="user")
    mock_es.append.assert_called_once()
    args = mock_es.append.call_args[0]
    assert args[1] == MEMORY_CONFIRMED


# ---------------------------------------------------------------------------
# test_reject_emits_MEMORY_REJECTED
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_reject_emits_MEMORY_REJECTED():
    svc = UniversalMemoryService()
    doc = _make_doc("mem-456")
    with (
        patch("memory.universal.knowledge_store") as mock_ks,
        patch("memory.universal.memory_event_store") as mock_es,
    ):
        mock_ks.get_by_id.return_value = doc
        mock_es.append = AsyncMock()
        await svc.reject("mem-456", actor="user")
    mock_es.append.assert_called_once()
    args = mock_es.append.call_args[0]
    assert args[1] == MEMORY_REJECTED


# ---------------------------------------------------------------------------
# test_promote_clears_expires_at
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_promote_clears_expires_at():
    svc = UniversalMemoryService()
    doc = _make_doc("mem-789", extra_meta={"expires_at": "2024-01-01T00:00:00+00:00"})
    with (
        patch("memory.universal.knowledge_store") as mock_ks,
        patch("memory.universal.memory_event_store") as mock_es,
    ):
        mock_ks.get_by_id.return_value = doc
        mock_es.append = AsyncMock()
        await svc.promote("mem-789")
    # Verify upsert called with expires_at=None
    add_call_kwargs = mock_ks.add.call_args
    assert add_call_kwargs is not None
    metadata_passed = add_call_kwargs[1]["metadata"] if add_call_kwargs[1] else add_call_kwargs[0][1]
    assert metadata_passed.get("expires_at") is None
    args = mock_es.append.call_args[0]
    assert args[1] == MEMORY_PROMOTED


# ---------------------------------------------------------------------------
# test_demote_sets_expires_at_30_days
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_demote_sets_expires_at_30_days():
    svc = UniversalMemoryService()
    doc = _make_doc("mem-abc")
    with (
        patch("memory.universal.knowledge_store") as mock_ks,
        patch("memory.universal.memory_event_store") as mock_es,
    ):
        mock_ks.get_by_id.return_value = doc
        mock_es.append = AsyncMock()
        await svc.demote("mem-abc")
    add_call = mock_ks.add.call_args
    metadata_passed = add_call[1]["metadata"] if add_call[1] else add_call[0][1]
    expires_at = metadata_passed.get("expires_at")
    assert expires_at is not None
    exp_dt = datetime.fromisoformat(expires_at)
    if exp_dt.tzinfo is None:
        exp_dt = exp_dt.replace(tzinfo=timezone.utc)
    diff = exp_dt - datetime.now(timezone.utc)
    assert 29 <= diff.days <= 30
    args = mock_es.append.call_args[0]
    assert args[1] == MEMORY_DEMOTED


# ---------------------------------------------------------------------------
# test_expire_due_deletes_expired_docs
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_expire_due_deletes_expired_docs():
    svc = UniversalMemoryService()
    past = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    doc = _make_doc("mem-old", extra_meta={"expires_at": past})
    with (
        patch("memory.universal.knowledge_store") as mock_ks,
        patch("memory.universal.memory_event_store") as mock_es,
    ):
        mock_ks.search.return_value = [doc]
        mock_es.append = AsyncMock()
        count = await svc.expire_due()
    assert count == 1
    mock_ks.delete.assert_called_once_with("mem-old")
    args = mock_es.append.call_args[0]
    assert args[1] == MEMORY_EXPIRED


# ---------------------------------------------------------------------------
# test_retrieve_filters_by_namespace
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_retrieve_filters_by_namespace():
    svc = UniversalMemoryService()
    doc_match = _make_doc("mem-match", extra_meta={"namespace": "user_memory:user1"})
    doc_other = _make_doc("mem-other", extra_meta={"namespace": "user_memory:user2"})
    with patch("memory.universal.knowledge_store") as mock_ks:
        mock_ks.search.return_value = [doc_match, doc_other]
        results = await svc.retrieve("query", user_id="user1")
    assert len(results) == 1
    assert results[0].id == "mem-match"


# ---------------------------------------------------------------------------
# test_create_preference_type_for_preference_text (UserMemoryExtractor wire-in)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_preference_type_for_preference_text():
    """Via UserMemoryExtractor._extract_and_store, preference facts get PREFERENCE type."""
    from memory.user_memory import UserMemoryExtractor
    from services.llm import LLMService

    mock_llm = MagicMock(spec=LLMService)
    mock_llm.chat = AsyncMock(return_value='["User likes dark mode"]')

    extractor = UserMemoryExtractor()
    extractor._llm = mock_llm

    created_types: list[MemoryType] = []

    async def _fake_create(text, memory_type, actor, user_id=None, session_id=None, source="chat", tags=None):
        created_types.append(memory_type)
        return MemoryObject(
            id="fake-id",
            text=text,
            memory_type=memory_type,
            importance_score=0.5,
            confirmation_state=ConfirmationState.PENDING,
            user_id=user_id,
            session_id=session_id,
            created_at=datetime.now(timezone.utc).isoformat(),
        )

    with (
        patch("memory.universal.universal_memory") as mock_um,
        patch("memory.intelligence.llm_service") as mock_intel_llm,
    ):
        mock_um.create = _fake_create
        mock_um.score = AsyncMock()
        mock_intel_llm.chat = AsyncMock(return_value='{"type": "PREFERENCE", "reason": "preference"}')
        await extractor._extract_and_store(
            user_message="I like dark mode",
            assistant_reply="Got it!",
            user_id="user1",
            session_id="sess1",
        )

    assert len(created_types) == 1
    assert created_types[0] == MemoryType.PREFERENCE
