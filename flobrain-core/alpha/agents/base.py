from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from typing import Any

from services.llm import LLMService, llm_service

logger = logging.getLogger(__name__)


@dataclass
class ToolCall:
    """Represents a tool invocation requested by the LLM."""
    name: str
    arguments: dict[str, Any]
    result: Any = None
    error: str | None = None


@dataclass
class AgentResponse:
    """The structured result returned by any agent."""
    content: str
    agent_name: str
    metadata: dict[str, Any] = field(default_factory=dict)
    tool_calls: list[ToolCall] = field(default_factory=list)


class BaseAgent(ABC):
    """
    Abstract base class for all FloBrain agents.

    Subclasses must set:
        name            - machine-readable identifier
        description     - human-readable summary
        system_prompt   - the system message sent to the LLM

    And optionally override:
        tools           - list of Tool instances available to this agent
    """

    name: str = "base"
    description: str = "Base agent"
    system_prompt: str = "You are a helpful AI assistant."

    def __init__(self, llm: LLMService | None = None) -> None:
        self.llm = llm or llm_service
        self.tools: list[Any] = []  # list[Tool] — avoids circular import

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    @abstractmethod
    async def run(
        self,
        messages: list[dict[str, str]],
        context: dict[str, Any] | None = None,
    ) -> AgentResponse:
        """
        Execute the agent and return a complete response.

        Args:
            messages: Conversation history in OpenAI format (role/content dicts).
            context:  Extra contextual information (user info, session data, etc.).
        """
        ...

    async def stream(
        self,
        messages: list[dict[str, str]],
        context: dict[str, Any] | None = None,
    ) -> AsyncGenerator[str, None]:
        """
        Stream the agent response as text chunks.

        Default implementation calls run() and yields the content at once.
        Subclasses may override for true token-by-token streaming.
        """
        response = await self.run(messages, context)
        yield response.content

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _build_messages(
        self,
        messages: list[dict[str, str]],
        context: dict[str, Any] | None = None,
    ) -> list[dict[str, str]]:
        """Prepend the system prompt and optionally inject context."""
        system = self.system_prompt
        if context:
            ctx_text = json.dumps(context, indent=2, ensure_ascii=False)
            system += f"\n\n## Context\n```json\n{ctx_text}\n```"
        full: list[dict[str, str]] = [{"role": "system", "content": system}]
        full.extend(messages)
        return full

    async def _llm_complete(
        self,
        messages: list[dict[str, str]],
        context: dict[str, Any] | None = None,
    ) -> str:
        """Build the full message list and call the LLM."""
        full_messages = self._build_messages(messages, context)
        result = await self.llm.chat(full_messages, stream=False)
        assert isinstance(result, str)
        return result

    async def _llm_stream(
        self,
        messages: list[dict[str, str]],
        context: dict[str, Any] | None = None,
    ) -> AsyncGenerator[str, None]:
        full_messages = self._build_messages(messages, context)
        gen = await self.llm.chat(full_messages, stream=True)
        async for chunk in gen:  # type: ignore[union-attr]
            yield chunk
