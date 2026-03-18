"""Tests for agents/nlu.py — NLUService."""
from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, patch

from agents.nlu import NLUService, NLUResult


# ---------------------------------------------------------------------------
# test_analyze_returns_nlu_result
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_analyze_returns_nlu_result():
    svc = NLUService()
    with patch("agents.nlu.llm_service") as mock_llm:
        mock_llm.chat = AsyncMock(
            return_value='{"intent": "ask a question", "entities": [{"type": "TOPIC", "value": "weather"}], "confidence": 0.9}'
        )
        result = await svc.analyze("What is the weather like?")
    assert isinstance(result, NLUResult)
    assert result.intent == "ask a question"
    assert result.confidence == pytest.approx(0.9)


# ---------------------------------------------------------------------------
# test_analyze_cache_hit
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_analyze_cache_hit():
    svc = NLUService()
    with patch("agents.nlu.llm_service") as mock_llm:
        mock_llm.chat = AsyncMock(
            return_value='{"intent": "greet", "entities": [], "confidence": 0.8}'
        )
        await svc.analyze("Hello world")
        await svc.analyze("Hello world")  # same text → cache hit
    mock_llm.chat.assert_called_once()


# ---------------------------------------------------------------------------
# test_analyze_different_texts_different_cache_keys
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_analyze_different_texts_different_cache_keys():
    svc = NLUService()
    with patch("agents.nlu.llm_service") as mock_llm:
        mock_llm.chat = AsyncMock(
            return_value='{"intent": "greet", "entities": [], "confidence": 0.8}'
        )
        await svc.analyze("Hello")
        await svc.analyze("Goodbye")
    assert mock_llm.chat.call_count == 2


# ---------------------------------------------------------------------------
# test_analyze_llm_failure_returns_fallback
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_analyze_llm_failure_returns_fallback():
    svc = NLUService()
    with patch("agents.nlu.llm_service") as mock_llm:
        mock_llm.chat = AsyncMock(side_effect=RuntimeError("LLM down"))
        result = await svc.analyze("some text")
    assert result.intent == "unknown"
    assert result.confidence == 0.0
    assert result.entities == []


# ---------------------------------------------------------------------------
# test_analyze_malformed_json_returns_fallback
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_analyze_malformed_json_returns_fallback():
    svc = NLUService()
    with patch("agents.nlu.llm_service") as mock_llm:
        mock_llm.chat = AsyncMock(return_value="not json at all")
        result = await svc.analyze("test message")
    assert result.intent == "unknown"
    assert result.confidence == 0.0


# ---------------------------------------------------------------------------
# test_entities_present_in_result
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_entities_present_in_result():
    svc = NLUService()
    with patch("agents.nlu.llm_service") as mock_llm:
        mock_llm.chat = AsyncMock(
            return_value='{"intent": "book meeting", "entities": [{"type": "PERSON", "value": "Alice"}, {"type": "TIME", "value": "3pm"}], "confidence": 0.85}'
        )
        result = await svc.analyze("Book a meeting with Alice at 3pm")
    assert len(result.entities) == 2
    assert any(e["value"] == "Alice" for e in result.entities)


# ---------------------------------------------------------------------------
# test_to_dict_has_all_keys
# ---------------------------------------------------------------------------

def test_to_dict_has_all_keys():
    result = NLUResult(
        intent="test",
        entities=[{"type": "X", "value": "y"}],
        confidence=0.7,
        raw_text="test message",
    )
    d = result.to_dict()
    assert "intent" in d
    assert "entities" in d
    assert "confidence" in d
    assert "raw_text" in d
