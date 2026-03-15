"""
Integration tests for the FloBrain API.

Run with:
    cd flobrain-core/alpha
    pip install pytest pytest-asyncio httpx
    pytest tests/test_api.py -v
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Ensure the app module path is importable when running from alpha/
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    """Health endpoint should always return 200."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "services" in data


@pytest.mark.asyncio
async def test_chat_no_auth(client: AsyncClient):
    """Chat endpoint should work without auth (anonymous session)."""
    response = await client.post(
        "/api/v1/chat",
        json={"message": "Hello, what is 2+2?"},
    )
    # Even if Ollama is not running, the response should be 200 with a graceful error
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "session_id" in data
    assert "agent_used" in data


@pytest.mark.asyncio
async def test_create_session(client: AsyncClient):
    """Creating a session should return a valid session ID."""
    response = await client.post(
        "/api/v1/chat/sessions",
        json={"title": "Test Session"},
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] == "Test Session"


@pytest.mark.asyncio
async def test_list_sessions(client: AsyncClient):
    """Session list should return a JSON array."""
    response = await client.get("/api/v1/chat/sessions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_session_not_found(client: AsyncClient):
    """Getting a non-existent session should return 404."""
    response = await client.get("/api/v1/chat/sessions/non-existent-id")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    """Register a user and log in to receive a JWT token."""
    import uuid

    unique = str(uuid.uuid4())[:8]
    email = f"test-{unique}@example.com"
    username = f"testuser-{unique}"

    # Register
    reg_response = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "username": username, "password": "securepass123"},
    )
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert reg_data["email"] == email

    # Login
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": "securepass123"},
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    assert login_data["token_type"] == "bearer"

    # Get /me with token
    token = login_data["access_token"]
    me_response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["username"] == username


@pytest.mark.asyncio
async def test_notion_status(client: AsyncClient):
    """Notion status endpoint should return a well-formed response."""
    response = await client.get("/api/v1/integrations/notion/status")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "connected" in data
    assert data["name"] == "notion"
