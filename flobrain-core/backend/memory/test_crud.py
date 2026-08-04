from memory.workflow_service import (
    create_workflow,
    get_workflow,
    update_workflow,
    delete_workflow,
    save_message,
    get_message,
    update_message,
    delete_message,
    save_llm_call,
    get_llm_call,
    update_llm_call,
    delete_llm_call,
)

from memory.knowledge_graph_service import (
    create_edge,
    get_edge,
    update_edge,
    delete_edge,
)


print("\n--- CREATE ---")

workflow_id = create_workflow(
    user_id="crud_test_user",
    preset_id="crud_test_workflow",
    version="v1"
)

message_id = save_message(
    user_id="crud_test_user",
    session_id="crud_test_session",
    workflow_id=workflow_id,
    role="user",
    content="Original CRUD test message"
)

llm_call_id = save_llm_call(
    user_id="crud_test_user",
    workflow_id=workflow_id,
    prompt="Original prompt",
    response="Original response",
    model="test-model"
)

edge_id = create_edge(
    source_type="user",
    source_id="crud_test_user",
    relationship="OWNS",
    target_type="workflow",
    target_id=workflow_id
)

print("Workflow created:", workflow_id)
print("Message created:", message_id)
print("LLM call created:", llm_call_id)
print("Graph edge created:", edge_id)


print("\n--- READ ---")

print("Workflow:", get_workflow(workflow_id))
print("Message:", get_message(message_id))
print("LLM Call:", get_llm_call(llm_call_id))
print("Graph Edge:", get_edge(edge_id))


print("\n--- UPDATE ---")

print(
    "Updated Workflow:",
    update_workflow(
        workflow_id,
        {"state.current_steps": ["crud_test_step"]}
    )
)

print(
    "Updated Message:",
    update_message(
        message_id,
        {"content": "Updated CRUD test message"}
    )
)

print(
    "Updated LLM Call:",
    update_llm_call(
        llm_call_id,
        {"response": "Updated response"}
    )
)

print(
    "Updated Graph Edge:",
    update_edge(
        edge_id,
        {"relationship": "CREATED"}
    )
)


print("\n--- DELETE ---")

print("Graph edge deleted:", delete_edge(edge_id))
print("LLM call deleted:", delete_llm_call(llm_call_id))
print("Message deleted:", delete_message(message_id))
print("Workflow deleted:", delete_workflow(workflow_id))


print("\n--- VERIFY DELETE ---")

print("Workflow after delete:", get_workflow(workflow_id))
print("Message after delete:", get_message(message_id))
print("LLM Call after delete:", get_llm_call(llm_call_id))
print("Graph Edge after delete:", get_edge(edge_id))