from __future__ import annotations

import logging
from collections.abc import AsyncGenerator
from pathlib import Path
from typing import Any

import yaml

from agents.base import AgentResponse

logger = logging.getLogger(__name__)

_DEFINITIONS_DIR = Path(__file__).parent / "definitions"


def _load_workflow(name: str) -> dict:
    """Load a YAML workflow definition by name."""
    path = _DEFINITIONS_DIR / f"{name}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Workflow definition not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


class WorkflowEngine:
    """
    Simple sequential workflow executor.

    The default workflow is:
      1. ControlAgent classifies the intent → selects an execution agent.
      2. The selected execution agent runs and produces a response.

    Workflow definitions (YAML) describe the agent chain and can be extended
    for multi-step pipelines (e.g. extract → reason → respond).
    """

    def __init__(self) -> None:
        self._agents: dict[str, Any] | None = None

    def _get_agents(self) -> dict[str, Any]:
        """Lazy-import agents to avoid circular imports at module load time."""
        if self._agents is None:
            from agents.control import control_agent
            from agents.general import general_agent
            from agents.notion_agent import notion_agent

            self._agents = {
                "control": control_agent,
                "general": general_agent,
                "notion": notion_agent,
            }
        return self._agents

    async def run(
        self,
        messages: list[dict[str, str]],
        context: dict[str, Any] | None = None,
    ) -> AgentResponse:
        """
        Execute the default workflow:
          Control → route → execute selected agent.
        """
        agents = self._get_agents()
        ctx = context or {}

        # Step 1: Route
        control = agents["control"]
        routed_to = await control.route(
            message=messages[-1]["content"] if messages else "",
            context=ctx,
        )
        logger.debug("Workflow routed to agent: %s", routed_to)

        # Step 2: Execute selected agent
        agent = agents.get(routed_to, agents["general"])
        response = await agent.run(messages, context=ctx)

        # Tag the routed_to in metadata
        response.metadata["routed_to"] = routed_to
        return response

    async def stream(
        self,
        messages: list[dict[str, str]],
        context: dict[str, Any] | None = None,
    ) -> AsyncGenerator[str, None]:
        """
        Stream the workflow response.

        Routes via ControlAgent, then streams from the selected agent.
        """
        agents = self._get_agents()
        ctx = context or {}

        # Route (non-streaming, fast)
        control = agents["control"]
        try:
            routed_to = await control.route(
                message=messages[-1]["content"] if messages else "",
                context=ctx,
            )
        except Exception as exc:
            logger.warning("Routing failed during stream: %s. Defaulting to general.", exc)
            routed_to = "general"

        agent = agents.get(routed_to, agents["general"])

        async for chunk in agent.stream(messages, context=ctx):
            yield chunk

    def load_workflow_definition(self, name: str = "default") -> dict:
        """Load and return a workflow YAML definition."""
        return _load_workflow(name)


# Module-level singleton
workflow_engine = WorkflowEngine()
