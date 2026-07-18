"""
supermemory_mock_server.py — Local mock of SuperMemory REST API for testing.

Standalone Flask app that mimics SuperMemory server endpoints:
    POST   /v3/documents
    POST   /v3/search
    GET    /v3/documents/<id>
    DELETE /v3/documents/<id>
    GET    /health

Usage:
    # Terminal 1 — start mock server
    python -m memory.supermemory_mock_server --port 8787

    # Terminal 2 — point connector at it
    export SUPERMEMORY_BASE_URL=http://localhost:8787
    docker compose restart web

    # Now /api/memory/sm/health reports mode=remote and tests
    # the real HTTP path through the connector.

Requires: pip install flask
"""
import argparse
import hashlib
import json
import logging
import time
import uuid
from typing import Dict

from flask import Flask, request, jsonify

logger = logging.getLogger(__name__)
app = Flask(__name__)

# In-memory storage (resets on restart)
_documents: Dict[str, Dict] = {}


def _doc_id() -> str:
    return f"sm_{uuid.uuid4().hex[:16]}"


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "supermemory-mock",
        "documents_count": len(_documents),
        "uptime_seconds": int(time.time() - _START_TIME),
    }), 200


@app.route("/v3/documents", methods=["POST"])
def create_document():
    body = request.get_json(silent=True) or {}
    content = body.get("content", "").strip()
    if not content:
        return jsonify({"error": "content required"}), 400

    doc_id = body.get("id") or _doc_id()
    metadata = body.get("metadata", {})

    _documents[doc_id] = {
        "id": doc_id,
        "content": content,
        "metadata": metadata,
        "created_at": time.time(),
        "chunk_count": max(1, len(content) // 500),
    }
    logger.info(f"[mock] create_document {doc_id} ({len(content)} chars)")
    return jsonify(_documents[doc_id]), 201


@app.route("/v3/documents/<doc_id>", methods=["GET"])
def get_document(doc_id):
    doc = _documents.get(doc_id)
    if not doc:
        return jsonify({"error": "not found"}), 404
    return jsonify(doc), 200


@app.route("/v3/documents/<doc_id>", methods=["DELETE"])
def delete_document(doc_id):
    if doc_id not in _documents:
        return jsonify({"error": "not found"}), 404
    del _documents[doc_id]
    logger.info(f"[mock] delete_document {doc_id}")
    return jsonify({"id": doc_id, "status": "deleted"}), 200


@app.route("/v3/search", methods=["POST"])
def search():
    body = request.get_json(silent=True) or {}
    query = (body.get("q") or body.get("query") or "").lower()
    limit = int(body.get("limit", body.get("top_n", 10)))
    filters = body.get("filters", {})

    # Naive substring search across stored documents
    results = []
    for doc in _documents.values():
        if filters:
            owner = doc.get("metadata", {}).get("owner_id")
            if filters.get("owner_id") and owner != filters["owner_id"]:
                continue
        if not query or query in doc.get("content", "").lower():
            # Score decays by recency
            score = max(0.1, 1.0 - (time.time() - doc["created_at"]) / 3600)
            results.append({
                "id": doc["id"],
                "content": doc["content"],
                "score": round(score, 4),
                "metadata": doc["metadata"],
            })
            if len(results) >= limit:
                break

    logger.info(f"[mock] search '{query}' → {len(results)} results")
    return jsonify(results), 200


@app.route("/v3/documents", methods=["GET"])
def list_documents():
    return jsonify(list(_documents.values())), 200


_START_TIME = time.time()


def main():
    parser = argparse.ArgumentParser(description="SuperMemory mock server")
    parser.add_argument("--port", type=int, default=8787, help="Port to listen on")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    logger.info(f"[mock] Starting SuperMemory mock on http://{args.host}:{args.port}")
    logger.info("[mock] Endpoints: POST /v3/documents, POST /v3/search, GET /health")
    app.run(host=args.host, port=args.port, debug=False)


if __name__ == "__main__":
    main()
