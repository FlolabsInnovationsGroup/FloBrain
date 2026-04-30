from memory.workflow_service import create_workflow, add_workflow_step

workflow_id = create_workflow("user_1", "basic_prompt", "v1")

step_id = add_workflow_step(
    workflow_id,
    "validate_input",
    {"text": "Hello"},
    {"valid": True}
)

print("Workflow event logged for workflow:", workflow_id)
print("Workflow:", workflow_id)
print("Step:", step_id)