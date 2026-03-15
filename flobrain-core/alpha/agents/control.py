from __future__ import annotations

import logging
import re
from typing import Any

from agents.base import AgentResponse, BaseAgent
from services.llm import LLMService, llm_service

logger = logging.getLogger(__name__)

KNOWN_AGENTS = ("general", "notion")

ROUTING_PROMPT = """\
You are a routing system for CAIPO, a wearable AI assistant.
Your only job is to classify which specialist agent should handle the user's message.

Available agents:
- "general" : general conversation, questions, reasoning, writing, math, coding
- "notion"  : anything related to Notion (tasks, projects, pages, databases, notes)

Respond with exactly one word — the agent name. Do not explain. Do not add punctuation.
Valid responses: general, notion
"""


class ControlAgent(BaseAgent):
    """
    Routes incoming messages to the appropriate specialist agent.

    Uses a fast LLM call to classify intent, then returns the agent name.
    Falls back to "general" on any error.
    """

    name = "control"
    description = "Routes user messages to the appropriate specialist agent."
    system_prompt = ROUTING_PROMPT

    def __init__(self, llm: LLMService | None = None) -> None:
        super().__init__(llm=llm)

    async def run(
        self,
        messages: list[dict[str, str]],
        context: dict[str, Any] | None = None,
    ) -> AgentResponse:
        agent_name = await self.route(
            message=messages[-1]["content"] if messages else "",
            context=context or {},
        )
        return AgentResponse(
            content=agent_name,
            agent_name=self.name,
            metadata={"routed_to": agent_name},
        )

    async def route(self, message: str, context: dict[str, Any] | None = None) -> str:
        """
        Classify the user message and return the name of the agent to invoke.

        Returns one of: "general", "notion".
        """
        routing_messages = [
            {"role": "system", "content": ROUTING_PROMPT},
            {"role": "user", "content": message},
        ]

        try:
            raw = await self.llm.chat(routing_messages, stream=False)
            assert isinstance(raw, str)
            # Extract the first word and normalise
            candidate = re.split(r"\W+", raw.strip().lower())[0]
            if candidate in KNOWN_AGENTS:
                logger.debug("Control agent routed '%s...' → %s", message[:40], candidate)
                return candidate
        except Exception as exc:
            logger.warning("ControlAgent routing failed: %s. Defaulting to 'general'.", exc)

        return "general"


# Module-level singleton
control_agent = ControlAgent()
