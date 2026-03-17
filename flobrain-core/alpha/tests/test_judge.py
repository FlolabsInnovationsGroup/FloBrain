"""
Unit tests for the JudgeAgent.

Run with:
    cd flobrain-core/alpha
    pytest tests/test_judge.py -v
"""
from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from agents.judge import JudgeAgent, JudgeVerdict, _parse_verdict


# ---------------------------------------------------------------------------
# _parse_verdict
# ---------------------------------------------------------------------------


def test_parse_verdict_all_passing():
    raw = '{"answers_question": true, "factually_grounded": true, "safe": true, "issues": [], "passed": true}'
    verdict = _parse_verdict(raw)
    assert verdict.answers_question is True
    assert verdict.factually_grounded is True
    assert verdict.safe is True
    assert verdict.issues == []
    assert verdict.passed is True
    assert verdict.skipped is False


def test_parse_verdict_failing():
    raw = """{
        "answers_question": false,
        "factually_grounded": true,
        "safe": true,
        "issues": ["Response does not address the question"],
        "passed": false
    }"""
    verdict = _parse_verdict(raw)
    assert verdict.answers_question is False
    assert verdict.passed is False
    assert len(verdict.issues) == 1
    assert "question" in verdict.issues[0]


def test_parse_verdict_with_markdown_fence():
    raw = '```json\n{"answers_question": true, "factually_grounded": true, "safe": false, "issues": ["Harmful content detected"], "passed": false}\n```'
    verdict = _parse_verdict(raw)
    assert verdict.safe is False
    assert verdict.passed is False
    assert verdict.issues == ["Harmful content detected"]


def test_parse_verdict_with_trailing_prose():
    raw = '{"answers_question": true, "factually_grounded": true, "safe": true, "issues": [], "passed": true}\n\nThis response looks good.'
    verdict = _parse_verdict(raw)
    assert verdict.passed is True


def test_parse_verdict_invalid_json_returns_passing():
    """When JSON is unparseable, optimistically assume passing."""
    verdict = _parse_verdict("This is not JSON at all")
    assert verdict.passed is True
    assert verdict.skipped is False


def test_parse_verdict_empty_string_returns_passing():
    verdict = _parse_verdict("")
    assert verdict.passed is True


def test_parse_verdict_derives_passed_from_dimensions():
    """passed should be False if ANY dimension is False, regardless of LLM-provided 'passed'."""
    # LLM says passed=true but safe=false — we override
    raw = '{"answers_question": true, "factually_grounded": true, "safe": false, "issues": [], "passed": true}'
    verdict = _parse_verdict(raw)
    # Our _parse_verdict recomputes passed from the three booleans
    assert verdict.passed is False


# ---------------------------------------------------------------------------
# JudgeVerdict helpers
# ---------------------------------------------------------------------------


def test_verdict_to_dict():
    v = JudgeVerdict(
        answers_question=True,
        factually_grounded=True,
        safe=True,
        issues=[],
        passed=True,
        skipped=False,
    )
    d = v.to_dict()
    assert d["passed"] is True
    assert d["skipped"] is False
    assert d["issues"] == []


def test_verdict_skipped_factory():
    v = JudgeVerdict.skipped_verdict()
    assert v.skipped is True
    assert v.passed is True  # skipped == no block


def test_verdict_passing_factory():
    v = JudgeVerdict.passing()
    assert v.passed is True
    assert v.skipped is False


# ---------------------------------------------------------------------------
# JudgeAgent.evaluate
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_judge_agent_returns_passing_verdict():
    mock_llm = MagicMock()
    mock_llm.chat = AsyncMock(
        return_value='{"answers_question": true, "factually_grounded": true, "safe": true, "issues": [], "passed": true}'
    )
    agent = JudgeAgent(llm=mock_llm)
    verdict = await agent.evaluate("What is Python?", "Python is a programming language.")
    assert verdict.passed is True
    assert verdict.skipped is False


@pytest.mark.asyncio
async def test_judge_agent_returns_failing_verdict():
    mock_llm = MagicMock()
    mock_llm.chat = AsyncMock(
        return_value='{"answers_question": false, "factually_grounded": true, "safe": true, "issues": ["Off-topic"], "passed": false}'
    )
    agent = JudgeAgent(llm=mock_llm)
    verdict = await agent.evaluate("What is Python?", "I like pizza.")
    assert verdict.passed is False
    assert verdict.answers_question is False


@pytest.mark.asyncio
async def test_judge_agent_skips_on_llm_error():
    """JudgeAgent must never raise — returns skipped verdict on LLM failure."""
    mock_llm = MagicMock()
    mock_llm.chat = AsyncMock(side_effect=Exception("LLM unavailable"))
    agent = JudgeAgent(llm=mock_llm)
    verdict = await agent.evaluate("Hello?", "Hi there!")
    assert verdict.skipped is True


# ---------------------------------------------------------------------------
# JudgeAgent.apply_verdict
# ---------------------------------------------------------------------------


def test_apply_verdict_passing_does_not_modify():
    agent = JudgeAgent()
    original = "Python is a programming language."
    result = agent.apply_verdict(original, JudgeVerdict.passing())
    assert result == original


def test_apply_verdict_skipped_does_not_modify():
    agent = JudgeAgent()
    original = "Some response."
    result = agent.apply_verdict(original, JudgeVerdict.skipped_verdict())
    assert result == original


def test_apply_verdict_failing_appends_disclaimer():
    agent = JudgeAgent()
    original = "Some potentially problematic response."
    verdict = JudgeVerdict(
        answers_question=False,
        factually_grounded=True,
        safe=True,
        issues=["Does not answer the question"],
        passed=False,
    )
    result = agent.apply_verdict(original, verdict)
    assert result.startswith(original)
    assert "Note:" in result or "note" in result.lower()


# ---------------------------------------------------------------------------
# Integration: WorkflowEngine wires judge into metadata
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_workflow_engine_includes_judge_metadata():
    """WorkflowEngine.run() should include 'judge' key in response metadata."""
    from agents.base import AgentResponse
    from agents.workflows.engine import WorkflowEngine

    engine = WorkflowEngine()

    mock_control = MagicMock()
    mock_control.route = AsyncMock(return_value="general")

    mock_general = MagicMock()
    mock_general.run = AsyncMock(
        return_value=AgentResponse(content="Hello!", agent_name="general")
    )

    mock_llm = MagicMock()
    mock_llm.chat = AsyncMock(
        return_value='{"answers_question": true, "factually_grounded": true, "safe": true, "issues": [], "passed": true}'
    )

    from agents.judge import JudgeAgent
    engine._agents = {"control": mock_control, "general": mock_general}

    import agents.workflows.engine as engine_mod
    original_judge = engine_mod.judge_agent if hasattr(engine_mod, "judge_agent") else None

    # Patch judge_agent inside the engine module
    import unittest.mock as mock
    with mock.patch("agents.judge.judge_agent", JudgeAgent(llm=mock_llm)):
        messages = [{"role": "user", "content": "Hello"}]
        response = await engine.run(messages)

    assert "judge" in response.metadata
    assert "routed_to" in response.metadata
    assert response.metadata["routed_to"] == "general"
