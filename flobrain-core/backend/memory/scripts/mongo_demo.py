from memory.workflow_service import (
    create_workflow,
    add_workflow_step,
    log_system_event,
    save_message,
    save_llm_call,
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
    input_data={"text": "Plan a trip to Paris"},
    output_data={"valid": True},
    status="success"
)

session_id = "session_001"

user_message_id = save_message(
    user_id="user_1",
    session_id=session_id,
    workflow_id=workflow_id,
    role="user",
    content="Plan a trip to Paris",
    metadata={"source": "test_mongo"}
)

assistant_message_id = save_message(
    user_id="user_1",
    session_id=session_id,
    workflow_id=workflow_id,
    role="assistant",
    content="Sure, I can help you plan a Paris trip.",
    metadata={"source": "test_mongo"}
)

llm_call_id = save_llm_call(
    user_id="user_1",
    workflow_id=workflow_id,
    prompt="Plan a trip to Paris",
    response="Here is a sample 5-day Paris itinerary.",
    model="gpt-4",
    metadata={"temperature": 0.7}
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

print("Workflow:", workflow_id)
print("Step:", step_id)
print("System Start Event:", start_event_id)
print("System End Event:", end_event_id)
print("System Error Event:", error_event_id)
print("User Message:", user_message_id)
print("Assistant Message:", assistant_message_id)
print("LLM Call:", llm_call_id)