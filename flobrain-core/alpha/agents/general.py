from __future__ import annotations

import logging
from collections.abc import AsyncGenerator
from typing import Any

from agents.base import AgentResponse, BaseAgent
from memory.conversation import conversation_memory
from memory.user_memory import user_memory_extractor
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
        user_id: str | None = ctx.get("user_id")

        # Enrich with recent history + user memory facts
        enriched_messages = await self._enrich_with_history(
            messages, session_id, user_id
        )

        try:
            content = await self._llm_complete(enriched_messages, context=None)
        except Exception as exc:
            logger.error("GeneralAgent LLM call failed: %s", exc)
            content = (
                "I'm sorry, I'm unable to reach the language model right now. "
                "Please check that Ollama is running and try again."
            )

        # Schedule background fact extraction (fire-and-forget)
        user_message = messages[-1]["content"] if messages else ""
        user_memory_extractor.schedule_extraction(
            user_message=user_message,
            assistant_reply=content,
            user_id=user_id,
            session_id=session_id,
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
        user_id: str | None = ctx.get("user_id")
        enriched_messages = await self._enrich_with_history(
            messages, session_id, user_id
        )

        full_content: list[str] = []
        try:
            async for chunk in self._llm_stream(enriched_messages, context=None):
                full_content.append(chunk)
                yield chunk
        except Exception as exc:
            logger.error("GeneralAgent streaming failed: %s", exc)
            error_msg = (
                "I'm sorry, I'm unable to reach the language model right now. "
                "Please check that Ollama is running and try again."
            )
            full_content.append(error_msg)
            yield error_msg

        # Schedule background fact extraction after stream completes
        user_message = messages[-1]["content"] if messages else ""
        user_memory_extractor.schedule_extraction(
            user_message=user_message,
            assistant_reply="".join(full_content),
            user_id=user_id,
            session_id=session_id,
        )

    async def _enrich_with_history(
        self,
        messages: list[dict[str, str]],
        session_id: str | None,
        user_id: str | None = None,
    ) -> list[dict[str, str]]:
        """
        Prepend the system prompt (enriched with user memory facts) and
        inject recent conversation history from DB if available.
        """
        # Fetch relevant user facts for the current query
        current_query = messages[-1]["content"] if messages else ""
        user_context = await user_memory_extractor.get_user_context(
            query=current_query,
            user_id=user_id,
            session_id=session_id,
        )

        # Build the system message, appending user facts when available
        system_content = self.system_prompt
        if user_context:
            system_content = f"{self.system_prompt}\n\n{user_context}"

        full: list[dict[str, str]] = [{"role": "system", "content": system_content}]

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
