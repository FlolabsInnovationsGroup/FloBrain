from __future__ import annotations

import json
import logging
from typing import Any

from agents.base import AgentResponse, BaseAgent
from agents.tools.notion_tools import ALL_NOTION_TOOLS
from services.llm import LLMService

logger = logging.getLogger(__name__)

NOTION_SYSTEM_PROMPT = """\
You are a Notion specialist assistant for CAIPO, the wearable AI by FloLabs.

You have access to the user's Notion workspace. You can:
- Search for pages and databases
- Read the contents of specific pages
- Query the Tasks database (get tasks, filter by status)
- Query the Projects database (get projects, filter by status)

When the user asks about their tasks, projects, notes, or anything stored in Notion,
use the appropriate tool to fetch the data, then summarise it clearly.

Guidelines:
- Always use tools to fetch live data — do not make up Notion content.
- If a tool call fails, explain the error clearly.
- Format lists and task summaries in a clean, readable way.
- If the Notion token is not configured, tell the user how to set it up.
"""


class NotionAgent(BaseAgent):
    """
    Agent specialised in querying and summarising Notion workspace data.

    Uses a simple tool-calling loop:
    1. Send the user message to the LLM with available tools listed.
    2. If the LLM requests a tool call, execute it and inject the result.
    3. Repeat up to MAX_ITERATIONS times, then return the final answer.
    """

    name = "notion"
    description = "Queries and summarises data from the connected Notion workspace."
    system_prompt = NOTION_SYSTEM_PROMPT

    MAX_ITERATIONS = 4

    def __init__(self, llm: LLMService | None = None) -> None:
        super().__init__(llm=llm)
        self.tools = list(ALL_NOTION_TOOLS)

    async def run(
        self,
        messages: list[dict[str, str]],
        context: dict[str, Any] | None = None,
    ) -> AgentResponse:
        full_messages = self._build_messages(messages, context)
        tool_calls_executed: list[Any] = []

        for iteration in range(self.MAX_ITERATIONS):
            # Build a tool description block to inject into the system prompt
            tool_desc = self._format_tools_for_prompt()

            # Inject tool descriptions into the last system message
            augmented = list(full_messages)
            if augmented and augmented[0]["role"] == "system":
                augmented[0] = {
                    "role": "system",
                    "content": augmented[0]["content"] + "\n\n" + tool_desc,
                }

            try:
                raw = await self.llm.chat(augmented, stream=False)
                assert isinstance(raw, str)
            except Exception as exc:
                logger.error("NotionAgent LLM call failed (iter %d): %s", iteration, exc)
                return AgentResponse(
                    content=(
                        "I'm unable to reach the language model right now. "
                        "Please check that Ollama is running."
                    ),
                    agent_name=self.name,
                )

            # Check if the LLM wants to call a tool
            tool_call = self._parse_tool_call(raw)
            if tool_call is None:
                # Final answer
                return AgentResponse(
                    content=raw,
                    agent_name=self.name,
                    tool_calls=tool_calls_executed,
                )

            # Execute the tool
            tool_name = tool_call.get("tool")
            tool_args = tool_call.get("args", {})
            tool_result = await self._execute_tool(tool_name, tool_args)
            tool_calls_executed.append({"tool": tool_name, "args": tool_args, "result": tool_result})

            # Inject tool result back into the conversation
            full_messages = augmented + [
                {"role": "assistant", "content": raw},
                {
                    "role": "user",
                    "content": (
                        f"Tool result for {tool_name}:\n"
                        f"```json\n{json.dumps(tool_result, indent=2)}\n```\n"
                        "Please summarise this for the user now."
                    ),
                },
            ]

        # Max iterations reached
        return AgentResponse(
            content=(
                "I've retrieved the data but hit the processing limit. "
                "Please try a more specific question."
            ),
            agent_name=self.name,
            tool_calls=tool_calls_executed,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _format_tools_for_prompt(self) -> str:
        """Return a text block describing available tools."""
        lines = ["## Available Tools\n"]
        lines.append(
            "When you need to call a tool, respond ONLY with JSON in this exact format "
            "(no other text):\n"
            '```json\n{"tool": "<tool_name>", "args": {<arguments>}}\n```\n'
        )
        lines.append("Available tools:\n")
        for tool in self.tools:
            params = list(tool.parameters.get("properties", {}).keys())
            lines.append(f"- **{tool.name}**: {tool.description}")
            if params:
                lines.append(f"  Parameters: {', '.join(params)}")
        return "\n".join(lines)

    def _parse_tool_call(self, response: str) -> dict[str, Any] | None:
        """
        Try to extract a tool call JSON block from the LLM response.

        Returns None if the response is a plain-text final answer.
        """
        stripped = response.strip()

        # Look for ```json ... ``` block
        if "```json" in stripped:
            start = stripped.index("```json") + 7
            end = stripped.index("```", start)
            json_str = stripped[start:end].strip()
        elif stripped.startswith("{") and stripped.endswith("}"):
            json_str = stripped
        else:
            return None

        try:
            data = json.loads(json_str)
            if "tool" in data:
                return data
        except (json.JSONDecodeError, ValueError):
            pass

        return None

    async def _execute_tool(self, tool_name: str, args: dict[str, Any]) -> Any:
        """Find and execute the named tool. Returns result or error dict."""
        for tool in self.tools:
            if tool.name == tool_name:
                result = await tool.execute(**args)
                if result.success:
                    return result.data
                return {"error": result.error}
        return {"error": f"Unknown tool: {tool_name}"}


# Module-level singleton
notion_agent = NotionAgent()
