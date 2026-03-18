"""Tests for WorkflowEngine retry logic and WorkflowStateStore."""
from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch, call

from agents.workflows.engine import WorkflowEngine, WorkflowState, WorkflowStateStore


def _make_engine_with_mocks(agent_run_side_effect=None):
    """Build a WorkflowEngine with mocked agents."""
    engine = WorkflowEngine()

    mock_control = MagicMock()
    mock_control.route = AsyncMock(return_value="general")

    mock_general = MagicMock()
    if agent_run_side_effect is None:
        mock_response = MagicMock()
        mock_response.content = "Hello!"
        mock_response.agent_name = "general"
        mock_response.metadata = {}
        mock_general.run = AsyncMock(return_value=mock_response)
    else:
        mock_general.run = AsyncMock(side_effect=agent_run_side_effect)

    mock_judge = MagicMock()
    mock_verdict = MagicMock()
    mock_verdict.passed = True
    mock_verdict.skipped = False
    mock_verdict.issues = []
    mock_verdict.to_dict = MagicMock(return_value={})
    mock_judge.evaluate = AsyncMock(return_value=mock_verdict)
    mock_judge.apply_verdict = MagicMock(return_value="Hello!")

    engine._agents = {
        "control": mock_control,
        "general": mock_general,
        "notion": MagicMock(),
    }
    return engine, mock_general, mock_judge


# ---------------------------------------------------------------------------
# test_workflow_state_saved_after_successful_run
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_workflow_state_saved_after_successful_run():
    engine, mock_general, mock_judge = _make_engine_with_mocks()

    saved_states: list[WorkflowState] = []

    async def _fake_save(state: WorkflowState):
        saved_states.append(state)

    with (
        patch("agents.workflows.engine.workflow_state_store") as mock_store,
        patch("agents.judge.judge_agent", mock_judge),
    ):
        mock_store.save = _fake_save
        await engine.run([{"role": "user", "content": "Hello"}], context={"session_id": "s1"})

    assert len(saved_states) == 1
    assert "general" in saved_states[0].completed_steps
    assert saved_states[0].current_step == "complete"


# ---------------------------------------------------------------------------
# test_workflow_state_load_returns_none_for_unknown
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_workflow_state_load_returns_none_for_unknown():
    store = WorkflowStateStore()
    with patch("agents.workflows.engine.WorkflowStateStore.load") as mock_load:
        mock_load.return_value = None
        result = await store.load("nonexistent-session")
    assert result is None


# ---------------------------------------------------------------------------
# test_retry_on_exception_succeeds_second_attempt
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_retry_on_exception_succeeds_second_attempt():
    engine = WorkflowEngine()

    mock_control = MagicMock()
    mock_control.route = AsyncMock(return_value="general")

    call_count = 0
    mock_response = MagicMock()
    mock_response.content = "Success on retry"
    mock_response.agent_name = "general"
    mock_response.metadata = {}

    async def _flaky_run(messages, context=None):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise RuntimeError("Transient failure")
        return mock_response

    mock_general = MagicMock()
    mock_general.run = _flaky_run

    mock_judge = MagicMock()
    mock_verdict = MagicMock()
    mock_verdict.passed = True
    mock_verdict.skipped = False
    mock_verdict.issues = []
    mock_verdict.to_dict = MagicMock(return_value={})
    mock_judge.evaluate = AsyncMock(return_value=mock_verdict)
    mock_judge.apply_verdict = MagicMock(return_value="Success on retry")

    engine._agents = {
        "control": mock_control,
        "general": mock_general,
        "notion": MagicMock(),
    }

    saved_states: list[WorkflowState] = []

    async def _fake_save(state):
        saved_states.append(state)

    with (
        patch("agents.workflows.engine.workflow_state_store") as mock_store,
        patch("agents.judge.judge_agent", mock_judge),
        patch("asyncio.sleep", new_callable=AsyncMock),
    ):
        mock_store.save = _fake_save
        response = await engine.run([{"role": "user", "content": "test"}], context={"session_id": "s2"})

    assert response.content == "Success on retry"
    assert len(saved_states) == 1
    assert "general" in saved_states[0].completed_steps


# ---------------------------------------------------------------------------
# test_max_retries_exceeded_raises_exception
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_max_retries_exceeded_raises_exception():
    engine = WorkflowEngine()

    mock_control = MagicMock()
    mock_control.route = AsyncMock(return_value="general")

    mock_general = MagicMock()
    mock_general.run = AsyncMock(side_effect=RuntimeError("Always fails"))

    engine._agents = {
        "control": mock_control,
        "general": mock_general,
        "notion": MagicMock(),
    }

    with (
        patch("agents.workflows.engine.workflow_state_store") as mock_store,
        patch("asyncio.sleep", new_callable=AsyncMock),
    ):
        mock_store.save = AsyncMock()
        with pytest.raises(RuntimeError, match="Always fails"):
            await engine.run([{"role": "user", "content": "test"}], context={"session_id": "s3"})


# ---------------------------------------------------------------------------
# test_failed_steps_recorded_on_retry
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_failed_steps_recorded_on_retry():
    engine = WorkflowEngine()

    mock_control = MagicMock()
    mock_control.route = AsyncMock(return_value="general")

    mock_general = MagicMock()
    mock_general.run = AsyncMock(side_effect=RuntimeError("Fail"))

    engine._agents = {
        "control": mock_control,
        "general": mock_general,
        "notion": MagicMock(),
    }

    saved_states: list[WorkflowState] = []

    async def _fake_save(state):
        saved_states.append(state)

    with (
        patch("agents.workflows.engine.workflow_state_store") as mock_store,
        patch("asyncio.sleep", new_callable=AsyncMock),
    ):
        mock_store.save = _fake_save
        with pytest.raises(RuntimeError):
            await engine.run([{"role": "user", "content": "test"}], context={"session_id": "s4"})

    # State should be saved with failed_steps recorded
    assert len(saved_states) >= 1
    assert len(saved_states[-1].failed_steps) > 0
    assert any("general" in s for s in saved_states[-1].failed_steps)
