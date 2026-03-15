from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    created_at: datetime
    is_active: bool


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------


class CreateSessionRequest(BaseModel):
    title: str = "New Conversation"


class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    user_id: str | None = None


class SessionDetailResponse(SessionResponse):
    messages: list[MessageResponse] = []


# ---------------------------------------------------------------------------
# Messages / Chat
# ---------------------------------------------------------------------------


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime
    metadata: dict[str, Any] = {}


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    session_id: str | None = None
    stream: bool = False
    context: dict[str, Any] | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    agent_used: str
    message_id: str | None = None
    metadata: dict[str, Any] = {}


# ---------------------------------------------------------------------------
# Audio
# ---------------------------------------------------------------------------


class TranscriptionResponse(BaseModel):
    text: str
    language: str | None = None
    segments: list[dict[str, Any]] = []


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------


class HealthResponse(BaseModel):
    status: str
    version: str
    services: dict[str, Any] = {}


# ---------------------------------------------------------------------------
# Integrations
# ---------------------------------------------------------------------------


class IntegrationStatusResponse(BaseModel):
    name: str
    connected: bool
    message: str = ""
