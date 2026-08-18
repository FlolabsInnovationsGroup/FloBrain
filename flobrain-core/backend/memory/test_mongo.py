from memory.workflow_service import (
    create_workflow,
    add_workflow_step,
    log_system_event,
)

workflow_id = create_workflow("user_1", "basic_prompt", "v1")

start_event_id = log_system_event(
    workflow_id=workflow_id,
    event_type="start",
    status="running",
    payload={"message": "Workflow execution started"}
)

step_id = add_workflow_step(
    workflow_id=workflow_id,
    step_type="validate_input",
    input_data={"text": "Hello"},
    output_data={"valid": True},
    status="success"
)

end_event_id = log_system_event(
    workflow_id=workflow_id,
    event_type="end",
    status="completed",
    payload={"message": "Workflow execution completed"}
)

error_event_id = log_system_event(
    workflow_id=workflow_id,
    event_type="error",
    status="failed",
    payload={"message": "Sample system error for testing"}
)

print("Workflow event logged for workflow:", workflow_id)
print("Workflow:", workflow_id)
print("Step:", step_id)
print("System Start Event:", start_event_id)
print("System End Event:", end_event_id)
print("System Error Event:", error_event_id)