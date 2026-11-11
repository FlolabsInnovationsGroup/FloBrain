from memory.knowledge_graph_service import (create_edge, get_edges_for_node, get_connected_nodes)

user_id = "user_1"
workflow_id = "6a3f763368a419ee09074c2d"
agent_id = "travel_agent_1"
tool_id = "google_maps_tool"
step_id = "validate_input_step"

edge_1 = create_edge("user", user_id, "OWNS", "workflow", workflow_id)
edge_2 = create_edge("workflow", workflow_id, "USES_AGENT", "agent", agent_id)
edge_3 = create_edge("agent", agent_id, "USES_TOOL", "tool", tool_id)
edge_4 = create_edge("workflow", workflow_id, "HAS_STEP", "step", step_id)

print("Created Edges:")
print(edge_1)
print(edge_2)
print(edge_3)
print(edge_4)

print("\nEdges connected to workflow:")
for edge in get_edges_for_node("workflow", workflow_id):
    print(edge)

print("\nNodes connected from workflow:")
for node in get_connected_nodes("workflow", workflow_id):
    print(node)
