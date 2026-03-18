from __future__ import annotations

import asyncio
import logging
import time
import uuid
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

from agents.base import AgentResponse

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Workflow dataclasses
# ---------------------------------------------------------------------------


@dataclass
class WorkflowStep:
    step_type: str  # "LLM_CALL" | "FUNCTION_CALL" | "DECISION"
    agent_id: str
    prompt_override: str | None = None
    required_tools: list[str] = field(default_factory=list)
    retry_config: dict = field(default_factory=lambda: {"max_retries": 2, "backoff_seconds": 1.0})


@dataclass
class WorkflowState:
    workflow_id: str
    session_id: str
    current_step: str
    completed_steps: list[str] = field(default_factory=list)
    failed_steps: list[str] = field(default_factory=list)
    context: dict = field(default_factory=dict)
    created_at: str = field(
        default_factory=lambda: __import__('datetime').datetime.now(
            __import__('datetime').timezone.utc
        ).isoformat()
    )
    updated_at: str = field(
        default_factory=lambda: __import__('datetime').datetime.now(
            __import__('datetime').timezone.utc
        ).isoformat()
    )


class WorkflowStateStore:
    async def save(self, state: WorkflowState) -> None:
        from db.database import AsyncSessionLocal
        from db.models import WorkflowStateModel
        from sqlalchemy import select
        from datetime import datetime, timezone

        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(WorkflowStateModel).where(WorkflowStateModel.session_id == state.session_id)
            )
            existing = result.scalar_one_or_none()
            now = datetime.now(timezone.utc)
            state_dict = {
                "workflow_id": state.workflow_id,
                "session_id": state.session_id,
                "current_step": state.current_step,
                "completed_steps": state.completed_steps,
                "failed_steps": state.failed_steps,
                "context": state.context,
                "created_at": state.created_at,
                "updated_at": now.isoformat(),
            }
            if existing:
                existing.state_json = state_dict
                existing.updated_at = now
            else:
                db.add(WorkflowStateModel(
                    id=str(uuid.uuid4()),
                    session_id=state.session_id,
                    state_json=state_dict,
                    created_at=now,
                    updated_at=now,
                ))
            await db.commit()

    async def load(self, session_id: str) -> WorkflowState | None:
        from db.database import AsyncSessionLocal
        from db.models import WorkflowStateModel
        from sqlalchemy import select

        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(WorkflowStateModel).where(WorkflowStateModel.session_id == session_id)
            )
            row = result.scalar_one_or_none()
            if row is None:
                return None
            d = row.state_json
            return WorkflowState(
                workflow_id=d.get("workflow_id", ""),
                session_id=d.get("session_id", session_id),
                current_step=d.get("current_step", ""),
                completed_steps=d.get("completed_steps", []),
                failed_steps=d.get("failed_steps", []),
                context=d.get("context", {}),
                created_at=d.get("created_at", ""),
                updated_at=d.get("updated_at", ""),
            )


workflow_state_store = WorkflowStateStore()

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
          Control → route → execute selected agent → judge.
        """
        from agents.judge import judge_agent

        agents = self._get_agents()
        ctx = context or {}

        # Step 1: Route
        control = agents["control"]
        routed_to = await control.route(
            message=messages[-1]["content"] if messages else "",
            context=ctx,
        )
        logger.debug("Workflow routed to agent: %s", routed_to)

        # Step 2: Execute selected agent with retry
        agent = agents.get(routed_to, agents["general"])
        max_retries = 2
        backoff = 1.0
        last_exc: Exception | None = None

        wf_id = str(uuid.uuid4())
        wf_state = WorkflowState(
            workflow_id=wf_id,
            session_id=ctx.get("session_id", ""),
            current_step="routing",
        )

        for attempt in range(max_retries + 1):
            try:
                response = await agent.run(messages, context=ctx)
                wf_state.current_step = "complete"
                wf_state.completed_steps.append(routed_to)
                break
            except Exception as exc:
                last_exc = exc
                wf_state.failed_steps.append(f"{routed_to}:attempt{attempt}")
                logger.warning(
                    "WorkflowEngine attempt %d/%d failed for agent %s: %s",
                    attempt + 1, max_retries + 1, routed_to, exc,
                )
                if attempt < max_retries:
                    await asyncio.sleep(backoff * (2 ** attempt))
                else:
                    # Save state before raising
                    try:
                        await workflow_state_store.save(wf_state)
                    except Exception:
                        pass
                    raise exc

        # Save state (best-effort, non-blocking)
        try:
            await workflow_state_store.save(wf_state)
        except Exception:
            pass

        # Step 3: Judge the response
        user_message = messages[-1]["content"] if messages else ""
        verdict = await judge_agent.evaluate(user_message, response.content)
        response.content = judge_agent.apply_verdict(response.content, verdict)
        response.metadata["routed_to"] = routed_to
        response.metadata["judge"] = verdict.to_dict()

        if not verdict.passed and not verdict.skipped:
            logger.warning(
                "JudgeAgent verdict FAILED for agent=%s issues=%s",
                routed_to,
                verdict.issues,
            )

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
        max_retries = 2
        backoff = 1.0

        wf_id = str(uuid.uuid4())
        wf_state = WorkflowState(
            workflow_id=wf_id,
            session_id=ctx.get("session_id", ""),
            current_step="routing",
        )

        for attempt in range(max_retries + 1):
            try:
                async for chunk in agent.stream(messages, context=ctx):
                    yield chunk
                wf_state.current_step = "complete"
                wf_state.completed_steps.append(routed_to)
                break
            except Exception as exc:
                wf_state.failed_steps.append(f"{routed_to}:attempt{attempt}")
                logger.warning(
                    "WorkflowEngine stream attempt %d/%d failed for agent %s: %s",
                    attempt + 1, max_retries + 1, routed_to, exc,
                )
                if attempt < max_retries:
                    await asyncio.sleep(backoff * (2 ** attempt))
                else:
                    try:
                        await workflow_state_store.save(wf_state)
                    except Exception:
                        pass
                    raise exc

        try:
            await workflow_state_store.save(wf_state)
        except Exception:
            pass

    def load_workflow_definition(self, name: str = "default") -> dict:
        """Load and return a workflow YAML definition."""
        return _load_workflow(name)


# Module-level singleton
workflow_engine = WorkflowEngine()
