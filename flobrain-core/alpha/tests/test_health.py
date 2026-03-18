"""Tests for the enhanced health endpoint."""
from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from api.routes.health import (
    health_check,
    _check_llm,
    _check_database,
    _check_vector_store,
    _check_transcription,
)
from config.settings import settings


def _all_ok_components():
    return {
        "llm": {"status": "ok", "model": "llama3.2", "latency_ms": 10.0},
        "db": {"status": "ok", "tables": 5},
        "vs": {"status": "ok", "collections": 1, "documents": 10},
        "transcription": {"status": "unavailable", "available": False},
    }


# ---------------------------------------------------------------------------
# test_health_returns_all_component_keys
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_health_returns_all_component_keys():
    with (
        patch("api.routes.health._check_llm", AsyncMock(return_value={"status": "ok", "model": "x", "latency_ms": 5})),
        patch("api.routes.health._check_database", AsyncMock(return_value={"status": "ok", "tables": 3})),
        patch("api.routes.health._check_vector_store", AsyncMock(return_value={"status": "ok", "collections": 1, "documents": 5})),
        patch("api.routes.health._check_transcription", AsyncMock(return_value={"status": "unavailable", "available": False})),
        patch("api.middleware.logging.get_request_count", return_value=0),
    ):
        result = await health_check()

    components = result["components"]
    for key in ("llm", "database", "vector_store", "embeddings", "transcription", "judge", "memory_intelligence"):
        assert key in components, f"Missing component: {key}"


# ---------------------------------------------------------------------------
# test_health_status_ok_when_all_pass
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_health_status_ok_when_all_pass():
    with (
        patch("api.routes.health._check_llm", AsyncMock(return_value={"status": "ok", "model": "x", "latency_ms": 5})),
        patch("api.routes.health._check_database", AsyncMock(return_value={"status": "ok", "tables": 3})),
        patch("api.routes.health._check_vector_store", AsyncMock(return_value={"status": "ok", "collections": 1, "documents": 5})),
        patch("api.routes.health._check_transcription", AsyncMock(return_value={"status": "ok", "available": True})),
        patch("api.middleware.logging.get_request_count", return_value=0),
    ):
        result = await health_check()

    assert result["status"] == "ok"


# ---------------------------------------------------------------------------
# test_health_degraded_when_llm_unavailable
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_health_degraded_when_llm_unavailable():
    with (
        patch("api.routes.health._check_llm", AsyncMock(return_value={"status": "unavailable", "model": "x", "latency_ms": None})),
        patch("api.routes.health._check_database", AsyncMock(return_value={"status": "ok", "tables": 3})),
        patch("api.routes.health._check_vector_store", AsyncMock(return_value={"status": "ok", "collections": 0, "documents": 0})),
        patch("api.routes.health._check_transcription", AsyncMock(return_value={"status": "unavailable", "available": False})),
        patch("api.middleware.logging.get_request_count", return_value=0),
    ):
        result = await health_check()

    assert result["status"] == "degraded"


# ---------------------------------------------------------------------------
# test_health_down_when_db_fails
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_health_down_when_db_fails():
    with (
        patch("api.routes.health._check_llm", AsyncMock(return_value={"status": "ok", "model": "x", "latency_ms": 5})),
        patch("api.routes.health._check_database", AsyncMock(return_value={"status": "error", "tables": 0, "detail": "no db"})),
        patch("api.routes.health._check_vector_store", AsyncMock(return_value={"status": "ok", "collections": 0, "documents": 0})),
        patch("api.routes.health._check_transcription", AsyncMock(return_value={"status": "unavailable", "available": False})),
        patch("api.middleware.logging.get_request_count", return_value=0),
    ):
        result = await health_check()

    assert result["status"] == "down"


# ---------------------------------------------------------------------------
# test_uptime_positive
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_uptime_positive():
    with (
        patch("api.routes.health._check_llm", AsyncMock(return_value={"status": "ok", "model": "x", "latency_ms": 5})),
        patch("api.routes.health._check_database", AsyncMock(return_value={"status": "ok", "tables": 3})),
        patch("api.routes.health._check_vector_store", AsyncMock(return_value={"status": "ok", "collections": 0, "documents": 0})),
        patch("api.routes.health._check_transcription", AsyncMock(return_value={"status": "unavailable", "available": False})),
        patch("api.middleware.logging.get_request_count", return_value=0),
    ):
        result = await health_check()

    assert result["uptime_seconds"] > 0


# ---------------------------------------------------------------------------
# test_request_count_present
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_request_count_present():
    with (
        patch("api.routes.health._check_llm", AsyncMock(return_value={"status": "ok", "model": "x", "latency_ms": 5})),
        patch("api.routes.health._check_database", AsyncMock(return_value={"status": "ok", "tables": 3})),
        patch("api.routes.health._check_vector_store", AsyncMock(return_value={"status": "ok", "collections": 0, "documents": 0})),
        patch("api.routes.health._check_transcription", AsyncMock(return_value={"status": "unavailable", "available": False})),
        patch("api.middleware.logging.get_request_count", return_value=42),
    ):
        result = await health_check()

    assert "request_count" in result
    assert isinstance(result["request_count"], int)


# ---------------------------------------------------------------------------
# test_version_in_response
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_version_in_response():
    with (
        patch("api.routes.health._check_llm", AsyncMock(return_value={"status": "ok", "model": "x", "latency_ms": 5})),
        patch("api.routes.health._check_database", AsyncMock(return_value={"status": "ok", "tables": 3})),
        patch("api.routes.health._check_vector_store", AsyncMock(return_value={"status": "ok", "collections": 0, "documents": 0})),
        patch("api.routes.health._check_transcription", AsyncMock(return_value={"status": "unavailable", "available": False})),
        patch("api.middleware.logging.get_request_count", return_value=0),
    ):
        result = await health_check()

    assert result["version"] == settings.VERSION
