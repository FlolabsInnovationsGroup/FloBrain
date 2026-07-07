from datetime import datetime
from memory.mongo_client import db


def _now():
    return datetime.utcnow()


def create_edge(source_type, source_id, relationship, target_type, target_id, metadata=None):
    edge = {
        "source_type": source_type,
        "source_id": source_id,
        "relationship": relationship,
        "target_type": target_type,
        "target_id": target_id,
        "metadata": metadata or {},
        "created_at": _now()
    }

    result = db.knowledge_edges.insert_one(edge)
    return str(result.inserted_id)


def get_edges_for_node(node_type, node_id):
    edges = list(db.knowledge_edges.find({
        "$or": [
            {"source_type": node_type, "source_id": node_id},
            {"target_type": node_type, "target_id": node_id}
        ]
    }))

    for edge in edges:
        edge["_id"] = str(edge["_id"])

    return edges


def get_connected_nodes(source_type, source_id, relationship=None):
    query = {
        "source_type": source_type,
        "source_id": source_id
    }

    if relationship:
        query["relationship"] = relationship

    edges = list(db.knowledge_edges.find(query))

    connected_nodes = []

    for edge in edges:
        connected_nodes.append({
            "relationship": edge["relationship"],
            "target_type": edge["target_type"],
            "target_id": edge["target_id"],
            "metadata": edge.get("metadata", {})
        })

    return connected_nodes

