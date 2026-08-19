from bson import ObjectId

from memory.mongo_client import db
from memory.embedding_service import search_messages
from memory.knowledge_graph_service import get_edges_for_node


def _serialize_document(document):
    if not document:
        return None

    serialized = dict(document)

    if "_id" in serialized:
        serialized["_id"] = str(serialized["_id"])

    return serialized


def _get_workflow(workflow_id):
    if not workflow_id:
        return None

    try:
        workflow = db.workflows.find_one({"_id": ObjectId(workflow_id)})
    except Exception:
        workflow = None

    return _serialize_document(workflow)


def retrieve_context(query, top_k=3, user_id=None):
    vector_results = search_messages(query, top_k=top_k)

    if user_id:
        vector_results = [
            message
            for message in vector_results
            if message.get("user_id") == user_id
        ]

    documents = []
    workflows = {}
    graph_relationships = []
    seen_edge_ids = set()

    for message in vector_results:
        documents.append(message)

        workflow_id = message.get("workflow_id")

        if not workflow_id:
            continue

        if workflow_id not in workflows:
            workflow = _get_workflow(workflow_id)

            if workflow:
                workflows[workflow_id] = workflow

        edges = get_edges_for_node("workflow", workflow_id)

        for edge in edges:
            edge_id = str(edge.get("_id"))

            if edge_id in seen_edge_ids:
                continue

            seen_edge_ids.add(edge_id)
            graph_relationships.append(edge)

    return {
        "query": query,
        "documents": documents,
        "workflows": list(workflows.values()),
        "graph_relationships": graph_relationships,
    }


def build_llm_context(query, top_k=3, user_id=None):
    retrieved = retrieve_context(
        query=query,
        top_k=top_k,
        user_id=user_id,
    )

    context_parts = [f"User query: {query}"]

    if retrieved["documents"]:
        context_parts.append("\nRelevant conversation memories:")

        for message in retrieved["documents"]:
            role = message.get("role", "unknown")
            content = message.get("content", "")
            context_parts.append(f"- {role}: {content}")

    if retrieved["workflows"]:
        context_parts.append("\nRelated workflows:")

        for workflow in retrieved["workflows"]:
            context_parts.append(
                f"- Workflow {workflow.get('_id')} "
                f"(preset={workflow.get('preset_workflow_id')}, "
                f"version={workflow.get('preset_version')})"
            )

    if retrieved["graph_relationships"]:
        context_parts.append("\nRelated graph relationships:")

        for edge in retrieved["graph_relationships"]:
            context_parts.append(
                f"- {edge.get('source_type')}:{edge.get('source_id')} "
                f"{edge.get('relationship')} "
                f"{edge.get('target_type')}:{edge.get('target_id')}"
            )

    return "\n".join(context_parts)