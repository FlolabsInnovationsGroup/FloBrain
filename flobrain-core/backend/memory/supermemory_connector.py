"""
supermemory_connector.py — HTTP connector to a SuperMemory server.

Endpoints:
    GET    /health                  — server health
    POST   /v3/documents            — store memory
    POST   /v3/search               — semantic search
    GET    /v3/documents/{id}       — fetch memory
    DELETE /v3/documents/{id}       — forget memory
    POST   /v3/profile              — user profile enrichment (NEW P1.W2.02)
    GET    /v3/connections          — list active connectors (NEW P1.W2.03)
    POST   /v3/documents (multipart)— upload file (NEW P1.W2.04)

Configuration (env vars):
    SUPERMEMORY_BASE_URL   — e.g. https://api.supermemory.ai or http://localhost:8787
    SUPERMEMORY_API_KEY    — bearer token (optional for self-hosted)
    SUPERMEMORY_TIMEOUT    — request timeout in seconds (default 2, critical for context)

Stub mode:
    When SUPERMEMORY_BASE_URL is unset, the connector runs in stub mode.
    All operations return stub responses — no network. When the real server
    is connected later, set the env var and restart — no code changes needed.
"""
import os
import logging
import time
from typing import Any, Dict, List, Optional

import requests

logger = logging.getLogger(__name__)

# P1.W2.01: Lowered from 10 to 2 seconds — context calls must not block > 2s
_DEFAULT_TIMEOUT = 2
_BASE_URL = os.getenv("SUPERMEMORY_BASE_URL") or ""
_API_KEY = os.getenv("SUPERMEMORY_API_KEY") or ""
_TIMEOUT = int(os.getenv("SUPERMEMORY_TIMEOUT", str(_DEFAULT_TIMEOUT)))


def is_configured() -> bool:
    """True if a SuperMemory server URL is configured."""
    return bool(_BASE_URL)


def _headers() -> Dict[str, str]:
    """Builds JSON request headers."""
    h = {"Content-Type": "application/json", "Accept": "application/json"}
    if _API_KEY:
        h["Authorization"] = f"Bearer {_API_KEY}"
    return h


def _multipart_headers() -> Dict[str, str]:
    """Builds multipart/form-data request headers (no Content-Type — let requests set boundary)."""
    h = {"Accept": "application/json"}
    if _API_KEY:
        h["Authorization"] = f"Bearer {_API_KEY}"
    return h


def _url(path: str) -> str:
    """Joins base URL and path."""
    return f"{_BASE_URL.rstrip('/')}/{path.lstrip('/')}"


def health() -> Dict[str, Any]:
    """Pings the SuperMemory server. Safe to call in stub mode."""
    if not is_configured():
        return {
            "status": "stub",
            "mode": "local_fallback",
            "base_url": None,
            "message": "SUPERMEMORY_BASE_URL not set; running in stub mode.",
        }

    started = time.monotonic()
    try:
        resp = requests.get(_url("/health"), headers=_headers(), timeout=_TIMEOUT)
        latency_ms = int((time.monotonic() - started) * 1000)
        if resp.status_code < 400:
            return {
                "status": "ok",
                "mode": "remote",
                "base_url": _BASE_URL,
                "http_status": resp.status_code,
                "latency_ms": latency_ms,
            }
        return {
            "status": "degraded",
            "mode": "remote",
            "base_url": _BASE_URL,
            "http_status": resp.status_code,
            "latency_ms": latency_ms,
            "message": resp.text[:200],
        }
    except requests.RequestException as e:
        logger.warning(f"[SuperMemory Connector] health check failed: {e}")
        return {
            "status": "unreachable",
            "mode": "remote",
            "base_url": _BASE_URL,
            "error": str(e),
        }


def create_document(
    content: str,
    metadata: Optional[Dict[str, Any]] = None,
    doc_id: Optional[str] = None,
) -> Dict[str, Any]:
    """POST /v3/documents — stores content as a SuperMemory document."""
    if not is_configured():
        return {"id": doc_id or "stub", "status": "stub"}

    payload: Dict[str, Any] = {"content": content}
    if metadata:
        payload["metadata"] = metadata
    if doc_id:
        payload["id"] = doc_id

    resp = requests.post(_url("/v3/documents"), json=payload, headers=_headers(), timeout=_TIMEOUT)
    if resp.status_code >= 400:
        raise RuntimeError(f"supermemory create_document failed: {resp.status_code} {resp.text}")
    return resp.json()


def search(query: str, top_n: int = 10, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """POST /v3/search — semantic search across memories."""
    if not is_configured():
        return []

    payload: Dict[str, Any] = {"q": query, "limit": top_n}
    if filters:
        payload["filters"] = filters

    resp = requests.post(_url("/v3/search"), json=payload, headers=_headers(), timeout=_TIMEOUT)
    if resp.status_code >= 400:
        raise RuntimeError(f"supermemory search failed: {resp.status_code} {resp.text}")
    data = resp.json()
    if isinstance(data, list):
        return data
    return data.get("results", data.get("documents", []))


def get_document(doc_id: str) -> Dict[str, Any]:
    """GET /v3/documents/{id} — fetches a single memory."""
    if not is_configured():
        return {"id": doc_id, "status": "stub"}

    resp = requests.get(_url(f"/v3/documents/{doc_id}"), headers=_headers(), timeout=_TIMEOUT)
    if resp.status_code >= 400:
        raise RuntimeError(f"supermemory get_document failed: {resp.status_code} {resp.text}")
    return resp.json()


def delete_document(doc_id: str) -> Dict[str, Any]:
    """DELETE /v3/documents/{id} — forgets a memory."""
    if not is_configured():
        return {"id": doc_id, "status": "stub_deleted"}

    resp = requests.delete(_url(f"/v3/documents/{doc_id}"), headers=_headers(), timeout=_TIMEOUT)
    if resp.status_code >= 400:
        raise RuntimeError(f"supermemory delete_document failed: {resp.status_code} {resp.text}")
    return resp.json() if resp.content else {"id": doc_id, "status": "deleted"}


# =============================================================================
# P1.W2.02 — get_profile() — user profile enrichment
# =============================================================================

def get_profile(owner_id: str, q: Optional[str] = None) -> Dict[str, Any]:
    """
    POST /v3/profile — returns user profile with static + dynamic facts.

    Returns:
        {
            "profile": {"static": [...], "dynamic": [...]},
            "searchResults": [...]
        }

    Stub mode: returns empty profile + empty search results.
    Remote mode: raises RuntimeError on 4xx/5xx, returns dict on success.
    """
    if not is_configured():
        return {
            "profile": {"static": [], "dynamic": []},
            "searchResults": [],
        }

    payload: Dict[str, Any] = {"userId": owner_id}
    if q:
        payload["q"] = q

    try:
        resp = requests.post(_url("/v3/profile"), json=payload, headers=_headers(), timeout=_TIMEOUT)
        if resp.status_code >= 400:
            raise RuntimeError(
                f"supermemory get_profile failed: {resp.status_code} {resp.text}"
            )
        return resp.json()
    except requests.RequestException as e:
        # Graceful fallback: timeout / network error → return empty profile
        logger.warning(f"[SuperMemory Connector] get_profile network error: {e}")
        return {
            "profile": {"static": [], "dynamic": []},
            "searchResults": [],
            "error": str(e),
        }


# =============================================================================
# P1.W2.03 — list_connections() — list active SuperMemory connectors
# =============================================================================

def list_connections() -> List[Dict[str, Any]]:
    """
    GET /v3/connections — returns list of active connectors (Drive/Notion/GitHub/etc).

    Returns:
        [{"id": "...", "name": "google_drive", "status": "active", "last_sync": "..."}]

    Stub mode: returns [].
    """
    if not is_configured():
        return []

    resp = requests.get(_url("/v3/connections"), headers=_headers(), timeout=_TIMEOUT)
    if resp.status_code >= 400:
        raise RuntimeError(
            f"supermemory list_connections failed: {resp.status_code} {resp.text}"
        )
    data = resp.json()
    if isinstance(data, list):
        return data
    return data.get("connections", [])


# =============================================================================
# P1.W2.04 — upload_file() — file upload via multipart/form-data
# =============================================================================

def upload_file(
    file_path: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    POST /v3/documents (multipart/form-data) — uploads a file for processing.

    Args:
        file_path: local path to the file to upload.
        metadata: optional metadata dict (e.g. {"owner_id": "...", "source": "drive"}).

    Returns:
        {"id": "...", "status": "indexed", "memories_extracted": N}

    Stub mode: returns {"id": "stub", "status": "stub"}.
    """
    if not is_configured():
        return {"id": "stub", "status": "stub"}

    import os as _os
    filename = _os.path.basename(file_path)

    with open(file_path, "rb") as f:
        files = {"file": (filename, f)}
        data = {}
        if metadata:
            data["metadata"] = str(metadata)

        resp = requests.post(
            _url("/v3/documents"),
            files=files,
            data=data,
            headers=_multipart_headers(),
            timeout=_TIMEOUT * 5,  # 5x timeout for file uploads
        )

    if resp.status_code >= 400:
        raise RuntimeError(
            f"supermemory upload_file failed: {resp.status_code} {resp.text}"
        )
    return resp.json()
