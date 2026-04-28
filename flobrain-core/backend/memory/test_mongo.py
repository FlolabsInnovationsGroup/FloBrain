from memory.workflow_service import (
    create_workflow,
    add_workflow_step,
    create_user_event
)

workflow_id = create_workflow("user_1", "basic_prompt", "v1")

step_id = add_workflow_step(
    workflow_id=workflow_id,
    step_type="validate_input",
    input_data={"text": "Hello"},
    output_data={"valid": True},
    status="success"
)

event_id = create_user_event(
    user_id="user_1",
    event_type="scheduled_workflow_created",
    workflow_id=workflow_id,
    preset_id="basic_prompt",
    version="v1",
    event_status="scheduled",
    payload={"input": "Hello"},
    scheduled_time="2026-04-29T10:00:00Z"
)

print("Workflow:", workflow_id)
print("Step:", step_id)
print("User Event:", event_id)