from __future__ import annotations

import json
import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from api.middleware.auth import get_optional_user
from api.schemas import (
    ChatRequest,
    ChatResponse,
    CreateSessionRequest,
    MessageResponse,
    SessionDetailResponse,
    SessionResponse,
)
from db.database import AsyncSessionLocal
from db.models import Message, Session, User
from agents.workflows.engine import workflow_engine
from memory.conversation import conversation_memory

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------


@router.post("/sessions", response_model=SessionResponse, status_code=201)
async def create_session(
    body: CreateSessionRequest,
    current_user: User | None = Depends(get_optional_user),
) -> SessionResponse:
    """Create a new chat session."""
    session_id = await conversation_memory.get_or_create_session(
        user_id=current_user.id if current_user else None,
        title=body.title,
    )
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Session).where(Session.id == session_id))
        session = result.scalar_one()

    return SessionResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        user_id=session.user_id,
    )


@router.get("/sessions", response_model=list[SessionResponse])
async def list_sessions(
    current_user: User | None = Depends(get_optional_user),
) -> list[SessionResponse]:
    """List chat sessions (filtered by user if authenticated)."""
    async with AsyncSessionLocal() as db:
        stmt = select(Session).order_by(Session.updated_at.desc()).limit(50)
        if current_user:
            stmt = stmt.where(Session.user_id == current_user.id)
        result = await db.execute(stmt)
        sessions = result.scalars().all()

    return [
        SessionResponse(
            id=s.id,
            title=s.title,
            created_at=s.created_at,
            updated_at=s.updated_at,
            user_id=s.user_id,
        )
        for s in sessions
    ]


@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
async def get_session(
    session_id: str,
    current_user: User | None = Depends(get_optional_user),
) -> SessionDetailResponse:
    """Get a session and its message history."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Session).where(Session.id == session_id))
        session = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    history = await conversation_memory.get_history(session_id, limit=100)
    messages = [
        MessageResponse(
            id=m["id"],
            role=m["role"],
            content=m["content"],
            created_at=m["created_at"],
            metadata=m.get("metadata", {}),
        )
        for m in history
    ]

    return SessionDetailResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        user_id=session.user_id,
        messages=messages,
    )


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------


@router.post("", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    current_user: User | None = Depends(get_optional_user),
) -> ChatResponse | StreamingResponse:
    """
    Send a message and get an AI response.

    Set stream=true for Server-Sent Events streaming.
    """
    # Ensure we have a session
    session_id = await conversation_memory.get_or_create_session(
        session_id=body.session_id,
        user_id=current_user.id if current_user else None,
    )

    # Persist the user message
    await conversation_memory.add_message(session_id, "user", body.message)

    # Build context
    context: dict[str, Any] = {
        "session_id": session_id,
        **(body.context or {}),
    }
    if current_user:
        context["user_id"] = current_user.id

    messages = [{"role": "user", "content": body.message}]

    if body.stream:
        return StreamingResponse(
            _stream_response(messages, context, session_id),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    # Non-streaming
    try:
        agent_response = await workflow_engine.run(messages, context)
    except Exception as exc:
        logger.error("Workflow engine error: %s", exc)
        agent_response_content = (
            "I'm having trouble processing your request right now. "
            "Please check that the language model service is running."
        )
        agent_name = "error"
        msg_id = await conversation_memory.add_message(session_id, "assistant", agent_response_content)
        return ChatResponse(
            response=agent_response_content,
            session_id=session_id,
            agent_used=agent_name,
            message_id=msg_id,
        )

    msg_id = await conversation_memory.add_message(
        session_id, "assistant", agent_response.content,
        metadata={"agent": agent_response.agent_name},
    )

    return ChatResponse(
        response=agent_response.content,
        session_id=session_id,
        agent_used=agent_response.agent_name,
        message_id=msg_id,
        metadata=agent_response.metadata,
    )


async def _stream_response(
    messages: list[dict],
    context: dict,
    session_id: str,
):
    """Async generator yielding SSE-formatted chunks."""
    full_content: list[str] = []
    agent_name = "general"

    try:
        async for chunk in workflow_engine.stream(messages, context):
            full_content.append(chunk)
            data = json.dumps({"delta": chunk, "session_id": session_id})
            yield f"data: {data}\n\n"
    except Exception as exc:
        logger.error("Streaming error: %s", exc)
        error_msg = "Streaming error: language model unavailable."
        full_content.append(error_msg)
        yield f"data: {json.dumps({'delta': error_msg, 'session_id': session_id})}\n\n"

    # Persist the complete assistant message
    complete = "".join(full_content)
    if complete:
        await conversation_memory.add_message(
            session_id, "assistant", complete,
            metadata={"agent": agent_name, "streamed": True},
        )

    yield f"data: {json.dumps({'done': True, 'session_id': session_id})}\n\n"
