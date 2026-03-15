"""
Unit tests for the FloBrain agent system.

Run with:
    cd flobrain-core/alpha
    pytest tests/test_agents.py -v
"""
from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from agents.base import AgentResponse
from agents.control import ControlAgent
from agents.general import GeneralAgent
from agents.notion_agent import NotionAgent


# ---------------------------------------------------------------------------
# ControlAgent
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_control_agent_routes_to_general():
    """ControlAgent should route generic messages to 'general'."""
    mock_llm = MagicMock()
    mock_llm.chat = AsyncMock(return_value="general")

    agent = ControlAgent(llm=mock_llm)
    result = await agent.route("What is the capital of France?")
    assert result == "general"


@pytest.mark.asyncio
async def test_control_agent_routes_to_notion():
    """ControlAgent should route Notion-related messages to 'notion'."""
    mock_llm = MagicMock()
    mock_llm.chat = AsyncMock(return_value="notion")

    agent = ControlAgent(llm=mock_llm)
    result = await agent.route("Show me my tasks in Notion")
    assert result == "notion"


@pytest.mark.asyncio
async def test_control_agent_fallback_on_error():
    """ControlAgent should fall back to 'general' on LLM failure."""
    mock_llm = MagicMock()
    mock_llm.chat = AsyncMock(side_effect=Exception("LLM unavailable"))

    agent = ControlAgent(llm=mock_llm)
    result = await agent.route("Some message")
    assert result == "general"


@pytest.mark.asyncio
async def test_control_agent_handles_unexpected_output():
    """ControlAgent should fall back to 'general' for unrecognised outputs."""
    mock_llm = MagicMock()
    mock_llm.chat = AsyncMock(return_value="FOOBAR_UNKNOWN_AGENT")

    agent = ControlAgent(llm=mock_llm)
    result = await agent.route("Some message")
    assert result == "general"


# ---------------------------------------------------------------------------
# GeneralAgent
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_general_agent_returns_response():
    """GeneralAgent should return a valid AgentResponse."""
    mock_llm = MagicMock()
    mock_llm.chat = AsyncMock(return_value="The capital of France is Paris.")

    with patch("agents.general.conversation_memory") as mock_memory:
        mock_memory.get_history = AsyncMock(return_value=[])

        agent = GeneralAgent(llm=mock_llm)
        messages = [{"role": "user", "content": "What is the capital of France?"}]
        response = await agent.run(messages)

    assert isinstance(response, AgentResponse)
    assert "Paris" in response.content
    assert response.agent_name == "general"


@pytest.mark.asyncio
async def test_general_agent_graceful_degradation():
    """GeneralAgent should return a helpful error when LLM is unavailable."""
    mock_llm = MagicMock()
    mock_llm.chat = AsyncMock(side_effect=Exception("Ollama not running"))

    with patch("agents.general.conversation_memory") as mock_memory:
        mock_memory.get_history = AsyncMock(return_value=[])

        agent = GeneralAgent(llm=mock_llm)
        messages = [{"role": "user", "content": "Hello"}]
        response = await agent.run(messages)

    assert isinstance(response, AgentResponse)
    assert response.agent_name == "general"
    # Should contain a graceful error message, not raise
    assert len(response.content) > 0


# ---------------------------------------------------------------------------
# NotionAgent
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_notion_agent_plain_response():
    """NotionAgent should return plain text when LLM does not call a tool."""
    mock_llm = MagicMock()
    mock_llm.chat = AsyncMock(return_value="You have 3 tasks due today.")

    agent = NotionAgent(llm=mock_llm)
    messages = [{"role": "user", "content": "What tasks do I have today?"}]
    response = await agent.run(messages)

    assert isinstance(response, AgentResponse)
    assert response.agent_name == "notion"
    assert "tasks" in response.content.lower()


@pytest.mark.asyncio
async def test_notion_agent_tool_call_parsing():
    """NotionAgent._parse_tool_call should extract JSON tool calls."""
    agent = NotionAgent()

    # Valid JSON tool call
    raw = '```json\n{"tool": "notion_search", "args": {"query": "tasks"}}\n```'
    parsed = agent._parse_tool_call(raw)
    assert parsed is not None
    assert parsed["tool"] == "notion_search"
    assert parsed["args"]["query"] == "tasks"

    # Plain text — no tool call
    plain = "Here are your tasks: 1, 2, 3."
    assert agent._parse_tool_call(plain) is None


# ---------------------------------------------------------------------------
# Workflow engine
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_workflow_engine_run():
    """WorkflowEngine should route and execute correctly."""
    from agents.workflows.engine import WorkflowEngine

    engine = WorkflowEngine()

    mock_control = MagicMock()
    mock_control.route = AsyncMock(return_value="general")

    mock_general = MagicMock()
    mock_general.run = AsyncMock(
        return_value=AgentResponse(content="Hello!", agent_name="general")
    )

    engine._agents = {"control": mock_control, "general": mock_general}

    messages = [{"role": "user", "content": "Hello"}]
    response = await engine.run(messages)

    assert response.content == "Hello!"
    assert response.metadata.get("routed_to") == "general"
