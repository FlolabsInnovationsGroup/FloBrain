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
from memory.store import knowledge_store
from memory.user_memory import _namespace
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
# Memory helpers
# ---------------------------------------------------------------------------

# Colour palette kept in sync with the frontend legend
_MEMORY_TYPE_COLOURS = {
    "user_fact":    "#10b981",  # green  → Interactions
    "conversation": "#3b82f6",  # blue   → Chunks
    "knowledge":    "#a78bfa",  # purple → Summaries
    "workflow":     "#fbbf24",  # yellow → Workflows
}

_FRONTEND_GROUP = {
    "user_fact":    "Interactions",
    "conversation": "Chunks",
    "knowledge":    "Summaries",
    "workflow":     "Workflows",
}


def _classify_memory(metadata: dict) -> str:
    """Return a memory_type string based on stored metadata."""
    ns: str = metadata.get("namespace", "")
    source: str = metadata.get("source", "")
    if "user_memory" in ns or source == "conversation":
        return "user_fact"
    if source in ("notion", "manual", "knowledge"):
        return "knowledge"
    if source == "workflow":
        return "workflow"
    return "conversation"


def _date_cutoff(date_range: str | None) -> datetime | None:
    now = datetime.now(timezone.utc)
    if date_range == "Last Week":
        return now - timedelta(days=7)
    if date_range == "Last Month":
        return now - timedelta(days=30)
    if date_range == "Last Year":
        return now - timedelta(days=365)
    return None


def _memory_nodes_from_store(
    user_id: str,
    session_id: str | None = None,
    search: str | None = None,
    date_range: str | None = None,
    memory_type: str | None = None,
    min_relevance: float = 0.0,
    n_results: int = 60,
) -> list[dict[str, Any]]:
    """
    Pull memory facts for this user from knowledge_store, apply filters,
    and return a list of MemoryNodeApi-shaped dicts.
    """
    query = search or "user memory facts"
    namespace = _namespace(user_id, session_id)
    raw = knowledge_store.search(query, n_results=n_results * 3)

    cutoff = _date_cutoff(date_range)
    results: list[dict[str, Any]] = []

    for r in raw:
        meta = r.get("metadata", {})
        ns: str = meta.get("namespace", "")

        # namespace filter: only this user's facts
        if not (ns == namespace or ns.startswith(f"user_memory:{user_id}")):
            continue

        score: float = r.get("score", 0.0)
        if score < min_relevance:
            continue

        m_type = _classify_memory(meta)
        frontend_group = _FRONTEND_GROUP.get(m_type, "Chunks")

        # memory_type filter (frontend label)
        if memory_type and memory_type != "All":
            type_map = {v: k for k, v in _FRONTEND_GROUP.items()}
            if type_map.get(memory_type) != m_type:
                continue

        # date filter
        extracted_at: str | None = meta.get("extracted_at")
        if cutoff and extracted_at:
            try:
                dt = datetime.fromisoformat(extracted_at)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                if dt < cutoff:
                    continue
            except ValueError:
                pass

        text: str = r.get("text", "")
        node_id: str = r.get("id", str(uuid.uuid4()))
        # val (size) proportional to score, clamped 3–20
        val = max(3, min(20, int(score * 20)))

        results.append({
            "id": node_id,
            "name": text[:80] + ("…" if len(text) > 80 else ""),
            "full_text": text,
            "val": val,
            "group": frontend_group,
            "memory_type": frontend_group,
            "relevance": round(score, 3),
            "created_at": extracted_at,
            "color": _MEMORY_TYPE_COLOURS.get(m_type, "#a78bfa"),
            "metadata": meta,
        })

        if len(results) >= n_results:
            break

    return results


def _build_links(nodes: list[dict[str, Any]]) -> list[dict[str, str]]:
    """
    Create similarity links: connect pairs that share the same group,
    up to 3 links per node to keep the graph readable.
    """
    from collections import defaultdict
    by_group: dict[str, list[str]] = defaultdict(list)
    for n in nodes:
        by_group[n["group"]].append(n["id"])

    links: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for group_nodes in by_group.values():
        for i, src in enumerate(group_nodes):
            count = 0
            for tgt in group_nodes[i + 1 :]:
                pair = (min(src, tgt), max(src, tgt))
                if pair not in seen and count < 3:
                    links.append({"source": src, "target": tgt})
                    seen.add(pair)
                    count += 1
    return links


# ---------------------------------------------------------------------------
# Memory CRUD  (/api/memory/*)
# ---------------------------------------------------------------------------

class AddMemoryRequest(BaseModel):
    text: str
    memory_type: str = "user_fact"  # user_fact | knowledge | workflow


@router.get("/api/memory/graph/")
async def memory_graph(
    search: str | None = None,
    date_range: str | None = None,
    memory_type: str | None = None,
    min_relevance: float = 0.0,
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Return the user's memory graph with filters applied.

    Nodes come from the ChromaDB knowledge_store, scoped to this user.
    Each node carries: id, name, val, group, memory_type, relevance, color, created_at.
    Links are auto-generated between nodes in the same group.
    """
    nodes = _memory_nodes_from_store(
        user_id=current_user.id,
        search=search,
        date_range=date_range,
        memory_type=memory_type,
        min_relevance=min_relevance,
    )
    links = _build_links(nodes)
    return {"nodes": nodes, "links": links}


@router.get("/api/memory/facts/")
async def list_memory_facts(
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    """Return all stored user facts (flat list, no graph formatting)."""
    nodes = _memory_nodes_from_store(user_id=current_user.id, n_results=100)
    return [
        {
            "id": n["id"],
            "text": n["full_text"],
            "memory_type": n["memory_type"],
            "relevance": n["relevance"],
            "created_at": n["created_at"],
        }
        for n in nodes
    ]


@router.post("/api/memory/facts/", status_code=201)
async def add_memory_fact(
    body: AddMemoryRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Manually add a memory fact for the current user.
    Stored in ChromaDB with the user's namespace so it surfaces in the graph.
    """
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")

    type_map = {
        "user_fact": "user_memory",
        "knowledge": "knowledge",
        "workflow": "workflow",
    }
    source = type_map.get(body.memory_type, "manual")
    namespace = _namespace(current_user.id, None)
    doc_id = str(uuid.uuid4())

    metadata: dict[str, Any] = {
        "namespace": namespace,
        "user_id": current_user.id,
        "source": source if source != "user_memory" else "conversation",
        "extracted_at": datetime.now(timezone.utc).isoformat(),
        "added_manually": True,
    }
    knowledge_store.add(text=body.text.strip(), metadata=metadata, doc_id=doc_id)

    return {
        "id": doc_id,
        "text": body.text.strip(),
        "memory_type": _FRONTEND_GROUP.get(
            _classify_memory(metadata), "Chunks"
        ),
        "created_at": metadata["extracted_at"],
    }


@router.delete("/api/memory/facts/{fact_id}/")
async def delete_memory_fact(
    fact_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Delete a specific memory fact by id.
    Returns 403 if the fact belongs to a different user.
    """
    doc = knowledge_store.get_by_id(fact_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Memory fact not found")

    meta = doc.get("metadata", {})
    stored_user = meta.get("user_id")
    ns: str = meta.get("namespace", "")
    if stored_user and stored_user != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if not stored_user and current_user.id not in ns:
        raise HTTPException(status_code=403, detail="Access denied")

    knowledge_store.delete(fact_id)
    return {"detail": "Deleted"}


# ---------------------------------------------------------------------------
# Dashboard routes  (/api/dashboard/*)
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Workflow errors  (/api/dashboard/workflow-errors/*)
# ---------------------------------------------------------------------------


def _relative_time(dt: datetime) -> str:
    """Return a human-readable relative time string."""
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    total_seconds = int(diff.total_seconds())
    if total_seconds < 60:
        return "just now"
    if total_seconds < 3600:
        mins = total_seconds // 60
        return f"{mins} min ago"
    if total_seconds < 86400:
        hours = total_seconds // 3600
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    days = total_seconds // 86400
    return f"{days} day{'s' if days != 1 else ''} ago"


async def _build_workflow_errors() -> list[dict[str, Any]]:
    """Compute real workflow errors from system state."""
    errors: list[dict[str, Any]] = []
    now = datetime.now(timezone.utc)

    # 1. LLM health check
    try:
        llm_status = await llm_service.health_check()
        if not llm_status.get("available", False):
            errors.append({
                "id": "llm-unavailable",
                "severity": "critical",
                "title": "LLM Service Unavailable",
                "description": "Ollama LLM service is not responding. AI chat functionality is disabled.",
                "component": "llm-service",
                "timestamp": now.isoformat(),
                "timestamp_relative": "just now",
                "details": {
                    "error_type": "ServiceUnavailableError",
                    "stack_trace": None,
                    "context": {"model": llm_service.ollama_model, "status": llm_status},
                    "resolution": "Ensure Ollama is running: `ollama serve`. Check that the model is pulled: `ollama pull llama3.2`.",
                    "affected_requests": 0,
                    "duration_ms": None,
                },
            })
    except Exception as exc:
        errors.append({
            "id": "llm-health-error",
            "severity": "critical",
            "title": "LLM Health Check Failed",
            "description": f"Could not reach LLM service: {exc}",
            "component": "llm-service",
            "timestamp": now.isoformat(),
            "timestamp_relative": "just now",
            "details": {
                "error_type": type(exc).__name__,
                "stack_trace": None,
                "context": {"exception": str(exc)},
                "resolution": "Ensure Ollama is running and accessible.",
                "affected_requests": 0,
                "duration_ms": None,
            },
        })

    # 2. Missing optional packages
    try:
        import faster_whisper  # noqa: F401
    except ImportError:
        errors.append({
            "id": "pkg-faster-whisper",
            "severity": "warning",
            "title": "Transcription Unavailable",
            "description": "`faster-whisper` is not installed. Audio transcription features are disabled.",
            "component": "transcription-service",
            "timestamp": now.isoformat(),
            "timestamp_relative": "just now",
            "details": {
                "error_type": "ImportError",
                "stack_trace": None,
                "context": {"package": "faster-whisper"},
                "resolution": "Install with: `pip install faster-whisper`",
                "affected_requests": 0,
                "duration_ms": None,
            },
        })

    try:
        import sentence_transformers  # noqa: F401
    except ImportError:
        errors.append({
            "id": "pkg-sentence-transformers",
            "severity": "warning",
            "title": "Embeddings Service Unavailable",
            "description": "`sentence-transformers` is not installed. Semantic embedding features are disabled.",
            "component": "embeddings-service",
            "timestamp": now.isoformat(),
            "timestamp_relative": "just now",
            "details": {
                "error_type": "ImportError",
                "stack_trace": None,
                "context": {"package": "sentence-transformers"},
                "resolution": "Install with: `pip install sentence-transformers`",
                "affected_requests": 0,
                "duration_ms": None,
            },
        })

    try:
        import chromadb  # noqa: F401
    except ImportError:
        errors.append({
            "id": "pkg-chromadb",
            "severity": "warning",
            "title": "Vector Store Unavailable",
            "description": "`chromadb` is not installed. Vector database and similarity search are disabled.",
            "component": "vector-store",
            "timestamp": now.isoformat(),
            "timestamp_relative": "just now",
            "details": {
                "error_type": "ImportError",
                "stack_trace": None,
                "context": {"package": "chromadb"},
                "resolution": "Install with: `pip install chromadb`",
                "affected_requests": 0,
                "duration_ms": None,
            },
        })

    # 3. Abandoned sessions (no messages, older than 30 min)
    cutoff = now - timedelta(minutes=30)
    try:
        async with AsyncSessionLocal() as db:
            sessions_result = await db.execute(select(Session))
            all_sessions = sessions_result.scalars().all()
            abandoned = []
            for s in all_sessions:
                created = s.created_at
                if created and created.tzinfo is None:
                    created = created.replace(tzinfo=timezone.utc)
                if created and created < cutoff:
                    msgs_result = await db.execute(
                        select(Message).where(Message.session_id == s.id).limit(1)
                    )
                    if not msgs_result.scalar_one_or_none():
                        abandoned.append(s)
        if abandoned:
            oldest = min(
                (s.created_at for s in abandoned if s.created_at),
                default=now,
            )
            if oldest.tzinfo is None:
                oldest = oldest.replace(tzinfo=timezone.utc)
            errors.append({
                "id": "db-abandoned-sessions",
                "severity": "info",
                "title": f"{len(abandoned)} Abandoned Session(s) Detected",
                "description": f"{len(abandoned)} chat session(s) were created but contain no messages and are over 30 minutes old.",
                "component": "database",
                "timestamp": oldest.isoformat(),
                "timestamp_relative": _relative_time(oldest),
                "details": {
                    "error_type": "AbandonedSessionWarning",
                    "stack_trace": None,
                    "context": {"abandoned_count": len(abandoned), "cutoff_minutes": 30},
                    "resolution": "Run a cleanup job to remove empty sessions older than 30 minutes.",
                    "affected_requests": len(abandoned),
                    "duration_ms": None,
                },
            })
    except Exception:
        pass

    # 4. Messages containing error text
    try:
        from sqlalchemy import or_
        async with AsyncSessionLocal() as db:
            err_result = await db.execute(
                select(Message).where(
                    or_(
                        Message.content.ilike("%error%"),
                        Message.content.ilike("%failed%"),
                        Message.content.ilike("%unavailable%"),
                    )
                ).order_by(Message.created_at.desc()).limit(20)
            )
            error_messages = err_result.scalars().all()
        if error_messages:
            latest = error_messages[0]
            latest_ts = latest.created_at or now
            if latest_ts.tzinfo is None:
                latest_ts = latest_ts.replace(tzinfo=timezone.utc)
            errors.append({
                "id": "db-error-messages",
                "severity": "warning",
                "title": f"{len(error_messages)} Message(s) Contain Error Text",
                "description": "Recent chat messages contain words like 'error', 'failed', or 'unavailable', suggesting AI pipeline issues.",
                "component": "conversation-engine",
                "timestamp": latest_ts.isoformat(),
                "timestamp_relative": _relative_time(latest_ts),
                "details": {
                    "error_type": "PipelineErrorSignal",
                    "stack_trace": None,
                    "context": {
                        "matched_message_count": len(error_messages),
                        "latest_message_snippet": (latest.content or "")[:120],
                    },
                    "resolution": "Review conversation logs to identify recurring AI pipeline failures.",
                    "affected_requests": len(error_messages),
                    "duration_ms": None,
                },
            })
    except Exception:
        pass

    return errors


@router.get("/api/dashboard/workflow-errors/")
async def dashboard_workflow_errors() -> list:
    """Return real system errors — no auth required."""
    return await _build_workflow_errors()


@router.get("/api/dashboard/workflow-errors/{error_id}/")
async def dashboard_workflow_error_detail(error_id: str) -> dict:
    """Return a single workflow error by id — no auth required."""
    errors = await _build_workflow_errors()
    for err in errors:
        if err["id"] == error_id:
            return err
    raise HTTPException(status_code=404, detail="Error not found")


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


# ---------------------------------------------------------------------------
# Memory confirmation / rejection / event history
# ---------------------------------------------------------------------------


@router.post("/api/memory/confirm/{memory_id}/")
async def confirm_memory(
    memory_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    from memory.universal import universal_memory
    await universal_memory.confirm(memory_id, actor="user")
    return {"detail": "confirmed", "memory_id": memory_id}


@router.post("/api/memory/reject/{memory_id}/")
async def reject_memory(
    memory_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    from memory.universal import universal_memory
    await universal_memory.reject(memory_id, actor="user")
    return {"detail": "rejected", "memory_id": memory_id}


@router.get("/api/memory/events/{memory_id}/")
async def get_memory_events(
    memory_id: str,
    current_user: User = Depends(get_current_user),
) -> list:
    from memory.events import memory_event_store
    events = await memory_event_store.get_history(memory_id)
    return [
        {
            "id": e.id,
            "event_type": e.event_type,
            "actor": e.actor,
            "payload": e.payload,
            "created_at": e.created_at.isoformat(),
        }
        for e in events
    ]
