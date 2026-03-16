"""
Compatibility router: maps frontend-expected API paths to the FloBrain backend.

The frontend (lobrain-website) expects routes at /api/auth/*, /api/brain/*,
/api/profile/*, /api/dashboard/*, /api/memory/*, while the core app exposes
them under /api/v1/*. This router bridges that gap without touching the
existing routes.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select

from agents.workflows.engine import workflow_engine
from api.middleware.auth import create_access_token, decode_token, get_current_user
from db.database import AsyncSessionLocal
from db.models import Message, Session, User
from memory.conversation import conversation_memory
from services.llm import llm_service

router = APIRouter()


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def _msg_to_frontend(msg: Message) -> dict[str, Any]:
    meta = msg.message_metadata or {}
    return {
        "id": msg.id,
        "role": msg.role,
        "type": msg.role if msg.role in ("user", "assistant") else "assistant",
        "text": msg.content,
        "image": meta.get("image"),
        "timestamp": msg.created_at.isoformat() if msg.created_at else None,
    }


async def _get_next_int_id(user_id: str) -> int:
    """Return the next sequential integer chat ID for this user."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Session).where(Session.user_id == user_id))
        sessions = result.scalars().all()
    max_id = 0
    for s in sessions:
        meta = s.session_metadata or {}
        int_id = meta.get("int_id", 0)
        if isinstance(int_id, int) and int_id > max_id:
            max_id = int_id
    return max_id + 1


async def _find_session_by_int_id(user_id: str, int_id: int) -> Session | None:
    """Find a session by its integer chat ID stored in session_metadata."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Session).where(Session.user_id == user_id))
        sessions = result.scalars().all()
    for s in sessions:
        meta = s.session_metadata or {}
        if meta.get("int_id") == int_id:
            return s
    return None


async def _load_messages(session_uuid: str) -> list[Message]:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Message)
            .where(Message.session_id == session_uuid)
            .order_by(Message.created_at)
        )
        return result.scalars().all()


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class SigninRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: str | None = None


class SignoutRequest(BaseModel):
    userId: str
    refresh_token: str


class RefreshRequest(BaseModel):
    refresh: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class DeleteAccountRequest(BaseModel):
    password: str


class UpdateProfileRequest(BaseModel):
    fullName: str | None = None
    email: str | None = None


class CreateChatRequest(BaseModel):
    title: str = "New Conversation"


class UpdateChatRequest(BaseModel):
    title: str


class SendMessageRequest(BaseModel):
    text: str | None = None
    image: str | None = None


# ---------------------------------------------------------------------------
# Auth routes  (/api/auth/*)
# ---------------------------------------------------------------------------


@router.post("/api/auth/signin/")
async def signin(body: SigninRequest) -> dict:
    """Sign in with email + password, returns access_token, refresh_token, userId."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == body.email))
        user = result.scalar_one_or_none()

    if user is None or not _verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    access_token = create_access_token(user.id, user.username)
    # For local dev: reuse the access token as the refresh token
    return {
        "access_token": access_token,
        "refresh_token": access_token,
        "userId": user.id,
    }


@router.post("/api/auth/register/")
async def register(body: RegisterRequest) -> dict:
    """Register a new user with name/email/password, returns tokens."""
    username_base = body.name.replace(" ", "_").lower()

    async with AsyncSessionLocal() as db:
        # Check email uniqueness first
        email_check = await db.execute(select(User).where(User.email == body.email))
        if email_check.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already taken")

        # Ensure unique username
        username = username_base
        uname_check = await db.execute(select(User).where(User.username == username))
        if uname_check.scalar_one_or_none():
            username = f"{username_base}_{str(uuid.uuid4())[:8]}"

        user = User(
            id=str(uuid.uuid4()),
            email=body.email,
            username=username,
            password_hash=_hash_password(body.password),
            created_at=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(user.id, user.username)
    return {
        "access_token": access_token,
        "refresh_token": access_token,
        "userId": user.id,
    }


@router.post("/api/auth/signout/")
async def signout(body: SignoutRequest) -> dict:
    """Sign out — stateless JWT, nothing to invalidate server-side for dev."""
    return {"detail": "Signed out"}


@router.post("/api/auth/refresh/")
async def refresh_token(body: RefreshRequest) -> dict:
    """Return a new access token given a valid refresh token."""
    payload = decode_token(body.refresh)  # raises 401 if invalid
    user_id: str = payload.get("sub", "")
    username: str = payload.get("username", "")
    new_token = create_access_token(user_id, username)
    return {"access": new_token}


# ---------------------------------------------------------------------------
# Profile routes  (/api/profile/*)
# ---------------------------------------------------------------------------


@router.get("/api/profile/")
async def get_profile(current_user: User = Depends(get_current_user)) -> dict:
    return {
        "id": current_user.id,
        "fullName": current_user.username,
        "email": current_user.email,
    }


@router.patch("/api/profile/")
async def update_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.id == current_user.id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if body.fullName is not None:
            user.username = body.fullName
        await db.commit()
        await db.refresh(user)

    return {
        "id": user.id,
        "fullName": user.username,
        "email": user.email,
    }


@router.post("/api/profile/change-password/")
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    if not _verify_password(body.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.id == current_user.id))
        user = result.scalar_one_or_none()
        if user:
            user.password_hash = _hash_password(body.new_password)
            await db.commit()

    return {"detail": "Password changed"}


@router.post("/api/profile/delete/")
async def delete_account(
    body: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    if not _verify_password(body.password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Password incorrect")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.id == current_user.id))
        user = result.scalar_one_or_none()
        if user:
            await db.delete(user)
            await db.commit()

    return {"detail": "Account deleted"}


# ---------------------------------------------------------------------------
# Memory graph  (/api/memory/graph/)
# ---------------------------------------------------------------------------


@router.get("/api/memory/graph/")
async def memory_graph(current_user: User = Depends(get_current_user)) -> dict:
    """Return a basic knowledge graph built from the user's chat sessions."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Session).where(Session.user_id == current_user.id)
        )
        sessions = result.scalars().all()

    nodes = []
    links = []

    for session in sessions:
        meta = session.session_metadata or {}
        int_id = meta.get("int_id", 0)
        nodes.append({
            "id": str(int_id),
            "label": session.title,
            "type": "session",
        })

    return {"nodes": nodes, "links": links}


# ---------------------------------------------------------------------------
# Dashboard routes  (/api/dashboard/*)
# ---------------------------------------------------------------------------


@router.get("/api/dashboard/health/")
async def dashboard_health() -> dict:
    """Check backend + database health."""
    llm_status = await llm_service.health_check()
    db_ok = True
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(select(User).limit(1))
    except Exception:
        db_ok = False

    all_ok = llm_status.get("available", False) and db_ok
    return {
        "status": "ok" if all_ok else "degraded",
        "backend": "ok" if llm_status.get("available") else "unavailable",
        "database": "ok" if db_ok else "error",
        "allSystemsOperational": all_ok,
        "model": llm_service.ollama_model,
        "availableModels": llm_status.get("models", []),
    }


@router.get("/api/dashboard/memory-activity/")
async def dashboard_memory_activity(
    current_user: User = Depends(get_current_user),
) -> dict:
    """Return message activity stats for the current user."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    prev_week_start = week_start - timedelta(days=7)

    async with AsyncSessionLocal() as db:
        sessions_result = await db.execute(
            select(Session).where(Session.user_id == current_user.id)
        )
        sessions = sessions_result.scalars().all()
        session_ids = [s.id for s in sessions]

        if not session_ids:
            return {
                "today_count": 0,
                "week_count": 0,
                "total_count": 0,
                "week_percentage": 0,
                "week_positive": True,
                "heatmap": [],
            }

        msgs_result = await db.execute(
            select(Message).where(
                Message.session_id.in_(session_ids),
                Message.role == "user",
            )
        )
        all_msgs = msgs_result.scalars().all()

    today_count = sum(1 for m in all_msgs if m.created_at and m.created_at >= today_start)
    week_count = sum(1 for m in all_msgs if m.created_at and m.created_at >= week_start)
    prev_week_count = sum(
        1 for m in all_msgs
        if m.created_at and prev_week_start <= m.created_at < week_start
    )
    total_count = len(all_msgs)

    week_percentage = 0
    week_positive = True
    if prev_week_count > 0:
        week_percentage = round(((week_count - prev_week_count) / prev_week_count) * 100)
        week_positive = week_percentage >= 0
    elif week_count > 0:
        week_percentage = 100
        week_positive = True

    heatmap = []
    for i in range(7):
        day_start = today_start - timedelta(days=6 - i)
        day_end = day_start + timedelta(days=1)
        count = sum(
            1 for m in all_msgs
            if m.created_at and day_start <= m.created_at < day_end
        )
        heatmap.append({"date": day_start.date().isoformat(), "count": count})

    return {
        "today_count": today_count,
        "week_count": week_count,
        "total_count": total_count,
        "week_percentage": abs(week_percentage),
        "week_positive": week_positive,
        "heatmap": heatmap,
    }


# ---------------------------------------------------------------------------
# Brain chat CRUD  (/api/brain/chats/*)
# ---------------------------------------------------------------------------


@router.get("/api/brain/chats/")
async def list_chats(current_user: User = Depends(get_current_user)) -> list:
    async with AsyncSessionLocal() as db:
        sessions_result = await db.execute(
            select(Session)
            .where(Session.user_id == current_user.id)
            .order_by(Session.updated_at.desc())
        )
        sessions = sessions_result.scalars().all()

        chats = []
        for session in sessions:
            msgs_result = await db.execute(
                select(Message)
                .where(Message.session_id == session.id)
                .order_by(Message.created_at)
            )
            messages = msgs_result.scalars().all()
            meta = session.session_metadata or {}
            chats.append({
                "id": meta.get("int_id", 0),
                "title": session.title,
                "timestamp": (session.updated_at or session.created_at).isoformat(),
                "messages": [_msg_to_frontend(m) for m in messages],
            })

    return chats


@router.post("/api/brain/chats/")
async def create_chat(
    body: CreateChatRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    int_id = await _get_next_int_id(current_user.id)

    async with AsyncSessionLocal() as db:
        session = Session(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            title=body.title,
            session_metadata={"int_id": int_id},
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)

    return {
        "id": int_id,
        "title": session.title,
        "timestamp": session.created_at.isoformat(),
        "messages": [],
    }


@router.get("/api/brain/chats/{chat_id}/")
async def get_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
) -> dict:
    session = await _find_session_by_int_id(current_user.id, chat_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages = await _load_messages(session.id)
    meta = session.session_metadata or {}

    return {
        "id": meta.get("int_id", chat_id),
        "title": session.title,
        "timestamp": (session.updated_at or session.created_at).isoformat(),
        "messages": [_msg_to_frontend(m) for m in messages],
    }


@router.patch("/api/brain/chats/{chat_id}/")
async def update_chat(
    chat_id: int,
    body: UpdateChatRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    session = await _find_session_by_int_id(current_user.id, chat_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat not found")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Session).where(Session.id == session.id))
        db_session = result.scalar_one_or_none()
        if db_session:
            db_session.title = body.title
            db_session.updated_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(db_session)
            session = db_session

    meta = session.session_metadata or {}
    return {
        "id": meta.get("int_id", chat_id),
        "title": session.title,
        "timestamp": (session.updated_at or session.created_at).isoformat(),
        "messages": [],
    }


@router.delete("/api/brain/chats/{chat_id}/")
async def delete_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
) -> dict:
    session = await _find_session_by_int_id(current_user.id, chat_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat not found")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Session).where(Session.id == session.id))
        db_session = result.scalar_one_or_none()
        if db_session:
            await db.delete(db_session)
            await db.commit()

    return {"detail": "Chat deleted"}


@router.post("/api/brain/chats/{chat_id}/send/")
async def send_message(
    chat_id: int,
    body: SendMessageRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Send a user message, run the AI workflow, return the full updated chat."""
    session = await _find_session_by_int_id(current_user.id, chat_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat not found")

    session_uuid = session.id
    meta = session.session_metadata or {}
    int_id = meta.get("int_id", chat_id)
    text = body.text or ""

    # Persist user message
    user_msg_meta: dict[str, Any] = {}
    if body.image:
        user_msg_meta["image"] = body.image
    await conversation_memory.add_message(session_uuid, "user", text, metadata=user_msg_meta)

    # Run workflow engine
    context: dict[str, Any] = {
        "session_id": session_uuid,
        "user_id": current_user.id,
    }
    messages = [{"role": "user", "content": text}]

    try:
        agent_response = await workflow_engine.run(messages, context)
        assistant_content = agent_response.content
    except Exception as exc:
        assistant_content = f"I'm sorry, I encountered an error processing your request. ({exc})"

    # Persist assistant reply
    await conversation_memory.add_message(session_uuid, "assistant", assistant_content)

    # Return full updated chat
    all_messages = await _load_messages(session_uuid)

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Session).where(Session.id == session_uuid))
        updated_session = result.scalar_one_or_none()

    title = updated_session.title if updated_session else "Conversation"
    timestamp = (
        updated_session.updated_at or updated_session.created_at
        if updated_session
        else datetime.now(timezone.utc)
    ).isoformat()

    return {
        "id": int_id,
        "title": title,
        "timestamp": timestamp,
        "messages": [_msg_to_frontend(m) for m in all_messages],
    }
