"""Tests for api/middleware/logging.py — RequestTracingMiddleware."""
from __future__ import annotations

import uuid

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.middleware.logging import RequestTracingMiddleware, get_request_count


def _make_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(RequestTracingMiddleware)

    @app.get("/ping")
    async def ping():
        return {"ok": True}

    return app


# ---------------------------------------------------------------------------
# test_x_request_id_in_response
# ---------------------------------------------------------------------------

def test_x_request_id_in_response():
    client = TestClient(_make_app())
    response = client.get("/ping")
    assert "X-Request-ID" in response.headers


# ---------------------------------------------------------------------------
# test_different_requests_different_ids
# ---------------------------------------------------------------------------

def test_different_requests_different_ids():
    client = TestClient(_make_app())
    r1 = client.get("/ping")
    r2 = client.get("/ping")
    assert r1.headers["X-Request-ID"] != r2.headers["X-Request-ID"]


# ---------------------------------------------------------------------------
# test_request_count_increments
# ---------------------------------------------------------------------------

def test_request_count_increments():
    import api.middleware.logging as logging_mod
    before = logging_mod._request_count
    client = TestClient(_make_app())
    client.get("/ping")
    client.get("/ping")
    client.get("/ping")
    after = logging_mod._request_count
    assert after >= before + 3


# ---------------------------------------------------------------------------
# test_request_id_is_valid_uuid
# ---------------------------------------------------------------------------

def test_request_id_is_valid_uuid():
    client = TestClient(_make_app())
    response = client.get("/ping")
    req_id = response.headers["X-Request-ID"]
    # Should parse without error
    parsed = uuid.UUID(req_id)
    assert str(parsed) == req_id
