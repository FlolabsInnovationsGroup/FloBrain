"""Tests for memory/intelligence.py — MemoryIntelligence."""
from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from memory.intelligence import MemoryIntelligence
from memory.universal import MemoryType, MemoryObject, ConfirmationState
from datetime import datetime, timezone


def _fake_mem_obj(text: str, m_type: MemoryType) -> MemoryObject:
    return MemoryObject(
        id="fake-id",
        text=text,
        memory_type=m_type,
        importance_score=0.5,
        confirmation_state=ConfirmationState.PENDING,
        user_id=None,
        session_id=None,
        created_at=datetime.now(timezone.utc).isoformat(),
    )


# ---------------------------------------------------------------------------
# score_importance (sync)
# ---------------------------------------------------------------------------

def test_score_importance_high_signal():
    mi = MemoryIntelligence()
    score = mi.score_importance("My name is Alice and I work at FloLabs")
    assert score >= 0.8


def test_score_importance_low_filler():
    mi = MemoryIntelligence()
    score = mi.score_importance("ok")
    assert score <= 0.3


def test_score_importance_short_text():
    mi = MemoryIntelligence()
    score = mi.score_importance("hello")
    assert score <= 0.4


# ---------------------------------------------------------------------------
# classify_type
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_classify_type_semantic():
    mi = MemoryIntelligence()
    with patch("memory.intelligence.llm_service") as mock_llm:
        mock_llm.chat = AsyncMock(return_value='{"type": "SEMANTIC", "reason": "factual"}')
        result = await mi.classify_type("The capital of France is Paris")
    assert result == MemoryType.SEMANTIC


@pytest.mark.asyncio
async def test_classify_type_fallback_on_error():
    mi = MemoryIntelligence()
    with patch("memory.intelligence.llm_service") as mock_llm:
        mock_llm.chat = AsyncMock(side_effect=RuntimeError("LLM error"))
        result = await mi.classify_type("some text")
    assert result == MemoryType.SEMANTIC


# ---------------------------------------------------------------------------
# chunk_and_store
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_chunk_and_store_short_text_single_chunk():
    mi = MemoryIntelligence()
    short_text = "This is a short text under 500 characters."
    with (
        patch("memory.intelligence.universal_memory") as mock_um,
        patch("memory.intelligence.llm_service") as mock_llm,
    ):
        mock_llm.chat = AsyncMock(return_value='{"score": 0.6, "reason": "ok"}')
        mock_um.create = AsyncMock(return_value=_fake_mem_obj(short_text, MemoryType.SEMANTIC))
        mock_um.score = AsyncMock()
        results = await mi.chunk_and_store(short_text, user_id=None, session_id="s1")
    assert len(results) == 1


@pytest.mark.asyncio
async def test_chunk_and_store_long_text_multiple_chunks():
    mi = MemoryIntelligence()
    # 1200 chars: should produce multiple chunks
    long_text = "A" * 1200
    with (
        patch("memory.intelligence.universal_memory") as mock_um,
        patch("memory.intelligence.llm_service") as mock_llm,
    ):
        mock_llm.chat = AsyncMock(return_value='{"score": 0.5, "reason": "ok"}')

        created: list[MemoryObject] = []

        async def _fake_create(**kwargs):
            obj = _fake_mem_obj(kwargs.get("text", ""), MemoryType.SEMANTIC)
            created.append(obj)
            return obj

        mock_um.create = _fake_create
        mock_um.score = AsyncMock()
        results = await mi.chunk_and_store(long_text, user_id=None, session_id="s1")
    assert len(results) >= 3


# ---------------------------------------------------------------------------
# score_importance_async
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_score_importance_async_calls_llm_for_ambiguous():
    """Sync score is 0.5 (ambiguous) → LLM should be called."""
    mi = MemoryIntelligence()
    # This text is long enough (>20 chars) and has no high-signal patterns → sync=0.5
    text = "User mentioned something interesting about their workflow process"
    with patch("memory.intelligence.llm_service") as mock_llm:
        mock_llm.chat = AsyncMock(return_value='{"score": 0.65, "reason": "moderately important"}')
        score = await mi.score_importance_async(text)
    mock_llm.chat.assert_called_once()
    assert score == pytest.approx(0.65)


@pytest.mark.asyncio
async def test_score_importance_async_no_llm_for_high():
    """Sync score is 0.85 → LLM should NOT be called."""
    mi = MemoryIntelligence()
    text = "My name is Bob and I always prefer dark mode"
    with patch("memory.intelligence.llm_service") as mock_llm:
        mock_llm.chat = AsyncMock(return_value='{"score": 0.9, "reason": "high"}')
        score = await mi.score_importance_async(text)
    mock_llm.chat.assert_not_called()
    assert score == pytest.approx(0.85)
