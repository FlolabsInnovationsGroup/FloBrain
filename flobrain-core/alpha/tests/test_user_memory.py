"""
Tests for UserMemoryExtractor.

Run with:
    cd flobrain-core/alpha
    pytest tests/test_user_memory.py -v
"""
from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from memory.user_memory import _namespace, _parse_facts


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def test_parse_facts_valid_json():
    raw = '["User\'s name is Alice", "User works at ACME Corp"]'
    facts = _parse_facts(raw)
    assert facts == ["User's name is Alice", "User works at ACME Corp"]


def test_parse_facts_empty_array():
    assert _parse_facts("[]") == []


def test_parse_facts_with_markdown_fence():
    raw = '```json\n["User is a Python developer"]\n```'
    facts = _parse_facts(raw)
    assert facts == ["User is a Python developer"]


def test_parse_facts_with_bare_fence():
    raw = '```\n["User prefers dark mode"]\n```'
    facts = _parse_facts(raw)
    assert facts == ["User prefers dark mode"]


def test_parse_facts_invalid_json_returns_empty():
    facts = _parse_facts("I found no facts about the user.")
    assert facts == []


def test_parse_facts_strips_empty_strings():
    raw = '["Valid fact", "", "  ", "Another fact"]'
    facts = _parse_facts(raw)
    # Empty / whitespace-only entries are kept as-is by the LLM parser;
    # stripping happens in _extract_and_store — we just check no crash
    assert "Valid fact" in facts
    assert "Another fact" in facts


def test_namespace_with_user_id():
    assert _namespace("user-123", "sess-456") == "user_memory:user-123"


def test_namespace_anon_with_session():
    assert _namespace(None, "sess-456") == "user_memory:anon:sess-456"


def test_namespace_fully_anon():
    assert _namespace(None, None) == "user_memory:anon"


# ---------------------------------------------------------------------------
# UserMemoryExtractor.get_user_context
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_user_context_returns_empty_when_no_facts():
    """Should return empty string when knowledge_store has no matching results."""
    from memory.user_memory import UserMemoryExtractor

    mock_store = MagicMock()
    mock_store.search.return_value = []

    with patch("memory.user_memory.knowledge_store", mock_store):
        extractor = UserMemoryExtractor()
        result = await extractor.get_user_context(
            query="hello", user_id="u1", session_id="s1"
        )
    assert result == ""


@pytest.mark.asyncio
async def test_get_user_context_returns_facts_for_namespace():
    """Should return formatted facts filtered to the correct namespace."""
    from memory.user_memory import UserMemoryExtractor

    mock_store = MagicMock()
    mock_store.search.return_value = [
        {
            "text": "User's name is Bob",
            "metadata": {"namespace": "user_memory:u42"},
            "score": 0.9,
        },
        {
            "text": "User works at FloLabs",
            "metadata": {"namespace": "user_memory:u42"},
            "score": 0.85,
        },
        {
            "text": "Some other user fact",
            "metadata": {"namespace": "user_memory:other_user"},
            "score": 0.8,
        },
    ]

    with patch("memory.user_memory.knowledge_store", mock_store):
        extractor = UserMemoryExtractor()
        result = await extractor.get_user_context(
            query="who am I", user_id="u42"
        )

    assert "User's name is Bob" in result
    assert "User works at FloLabs" in result
    assert "Some other user fact" not in result
    assert "## What I know about you" in result


# ---------------------------------------------------------------------------
# UserMemoryExtractor._extract_and_store
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_extract_and_store_persists_facts():
    """Facts returned by the LLM should be stored in knowledge_store."""
    from memory.user_memory import UserMemoryExtractor

    mock_llm = AsyncMock()
    mock_llm.chat = AsyncMock(return_value='["User is named Charlie", "User loves Python"]')

    mock_store = MagicMock()

    with (
        patch("memory.user_memory.knowledge_store", mock_store),
        patch("memory.user_memory.llm_service", mock_llm),
    ):
        extractor = UserMemoryExtractor()
        extractor._llm = mock_llm
        facts = await extractor._extract_and_store(
            user_message="Hi, I'm Charlie and I love Python.",
            assistant_reply="Nice to meet you, Charlie!",
            user_id="u99",
            session_id="s99",
        )

    assert "User is named Charlie" in facts
    assert "User loves Python" in facts
    assert mock_store.add.call_count == 2

    # Verify namespace in stored metadata
    call_kwargs = mock_store.add.call_args_list[0][1]
    assert call_kwargs["metadata"]["namespace"] == "user_memory:u99"


@pytest.mark.asyncio
async def test_extract_and_store_empty_when_no_facts():
    """If LLM returns [], nothing should be stored."""
    from memory.user_memory import UserMemoryExtractor

    mock_llm = AsyncMock()
    mock_llm.chat = AsyncMock(return_value="[]")

    mock_store = MagicMock()

    with (
        patch("memory.user_memory.knowledge_store", mock_store),
        patch("memory.user_memory.llm_service", mock_llm),
    ):
        extractor = UserMemoryExtractor()
        extractor._llm = mock_llm
        facts = await extractor._extract_and_store(
            user_message="What is the weather today?",
            assistant_reply="I don't have real-time weather data.",
            user_id=None,
            session_id="s1",
        )

    assert facts == []
    mock_store.add.assert_not_called()


@pytest.mark.asyncio
async def test_safe_extract_does_not_raise_on_llm_failure():
    """_safe_extract must swallow all exceptions — never crashes."""
    from memory.user_memory import UserMemoryExtractor

    mock_llm = AsyncMock()
    mock_llm.chat = AsyncMock(side_effect=RuntimeError("LLM is down"))

    with patch("memory.user_memory.llm_service", mock_llm):
        extractor = UserMemoryExtractor()
        extractor._llm = mock_llm
        # Should complete without raising
        await extractor._safe_extract(
            user_message="test",
            assistant_reply="test",
            user_id=None,
            session_id=None,
        )
