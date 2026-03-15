from __future__ import annotations

import logging
from collections.abc import AsyncGenerator
from typing import Any

from agents.base import AgentResponse, BaseAgent
from memory.conversation import conversation_memory
from services.llm import LLMService

logger = logging.getLogger(__name__)

GENERAL_SYSTEM_PROMPT = """\
You are CAIPO, an intelligent wearable AI assistant built by FloLabs.

You help users with:
- General questions, research, and reasoning
- Writing, editing, and summarization
- Math, coding, and analysis
- Planning, brainstorming, and problem-solving
- Recalling past conversations and context

Personality:
- Concise and direct — avoid unnecessary padding
- Warm but professional
- Honest about your limitations
- You always let the user know if you need more context

When you don't know something, say so clearly. Do not hallucinate facts.
If the user asks about their Notion workspace, tasks, or projects, let them know \
you are the general assistant and suggest they try the Notion-specific commands.
"""


class GeneralAgent(BaseAgent):
    """
    Handles general conversation and open-ended questions.
    Enriches responses with recent conversation history.
    """

    name = "general"
    description = "General-purpose conversational AI assistant (CAIPO)."
    system_prompt = GENERAL_SYSTEM_PROMPT

    def __init__(self, llm: LLMService | None = None) -> None:
        super().__init__(llm=llm)

    async def run(
        self,
        messages: list[dict[str, str]],
        context: dict[str, Any] | None = None,
    ) -> AgentResponse:
        ctx = context or {}
        session_id: str | None = ctx.get("session_id")

        # Enrich with recent memory if available
        enriched_messages = await self._enrich_with_history(messages, session_id)

        try:
            content = await self._llm_complete(enriched_messages, context=None)
        except Exception as exc:
            logger.error("GeneralAgent LLM call failed: %s", exc)
            content = (
                "I'm sorry, I'm unable to reach the language model right now. "
                "Please check that Ollama is running and try again."
            )

        return AgentResponse(
            content=content,
            agent_name=self.name,
            metadata={"session_id": session_id},
        )

    async def stream(
        self,
        messages: list[dict[str, str]],
        context: dict[str, Any] | None = None,
    ) -> AsyncGenerator[str, None]:
        ctx = context or {}
        session_id: str | None = ctx.get("session_id")
        enriched_messages = await self._enrich_with_history(messages, session_id)

        try:
            async for chunk in self._llm_stream(enriched_messages, context=None):
                yield chunk
        except Exception as exc:
            logger.error("GeneralAgent streaming failed: %s", exc)
            yield (
                "I'm sorry, I'm unable to reach the language model right now. "
                "Please check that Ollama is running and try again."
            )

    async def _enrich_with_history(
        self, messages: list[dict[str, str]], session_id: str | None
    ) -> list[dict[str, str]]:
        """
        Prepend the system prompt and inject recent history from DB if available.
        """
        # Build the system message
        full: list[dict[str, str]] = [{"role": "system", "content": self.system_prompt}]

        if session_id and messages:
            try:
                history = await conversation_memory.get_history(session_id, limit=20)
                # Add history messages that aren't already in `messages`
                existing_contents = {m["content"] for m in messages}
                for h in history:
                    if h["content"] not in existing_contents:
                        full.append({"role": h["role"], "content": h["content"]})
            except Exception as exc:
                logger.debug("Could not load history for session %s: %s", session_id, exc)

        full.extend(messages)
        return full


# Module-level singleton
general_agent = GeneralAgent()
