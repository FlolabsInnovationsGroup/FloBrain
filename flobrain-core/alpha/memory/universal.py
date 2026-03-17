from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import Any

from memory.store import knowledge_store
from memory.events import (
    memory_event_store,
    MEMORY_CREATED,
    MEMORY_SCORED,
    MEMORY_PROMOTED,
    MEMORY_DEMOTED,
    MEMORY_CONFIRMED,
    MEMORY_REJECTED,
    MEMORY_EXPIRED,
)


class MemoryType(str, Enum):
    EPISODIC = "EPISODIC"
    SEMANTIC = "SEMANTIC"
    PREFERENCE = "PREFERENCE"
    PROCEDURAL = "PROCEDURAL"
    TASK = "TASK"
    SYSTEM = "SYSTEM"


class ConfirmationState(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"


# Map to frontend groups (for graph display)
MEMORY_TYPE_FRONTEND_GROUP = {
    MemoryType.EPISODIC: "Interactions",
    MemoryType.SEMANTIC: "Summaries",
    MemoryType.PREFERENCE: "Chunks",
    MemoryType.PROCEDURAL: "Workflows",
    MemoryType.TASK: "Chunks",
    MemoryType.SYSTEM: "Summaries",
}


@dataclass
class MemoryObject:
    id: str
    text: str
    memory_type: MemoryType
    importance_score: float
    confirmation_state: ConfirmationState
    user_id: str | None
    session_id: str | None
    created_at: str
    last_accessed_at: str | None = None
    expires_at: str | None = None
    tags: list[str] = field(default_factory=list)
    source: str = "chat"


def _namespace(user_id: str | None, session_id: str | None) -> str:
    if user_id:
        return f"user_memory:{user_id}"
    if session_id:
        return f"user_memory:anon:{session_id}"
    return "user_memory:anon"


class UniversalMemoryService:

    async def create(
        self,
        text: str,
        memory_type: MemoryType,
        actor: str,
        user_id: str | None = None,
        session_id: str | None = None,
        source: str = "chat",
        tags: list[str] | None = None,
    ) -> MemoryObject:
        doc_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        ns = _namespace(user_id, session_id)
        metadata: dict[str, Any] = {
            "namespace": ns,
            "source": source,
            "memory_type": memory_type.value,
            "importance_score": 0.5,
            "confirmation_state": ConfirmationState.PENDING.value,
            "tags": json.dumps(tags or []),
            "extracted_at": now.isoformat(),
            "expires_at": None,
        }
        if user_id:
            metadata["user_id"] = user_id
        if session_id:
            metadata["session_id"] = session_id

        knowledge_store.add(text=text, metadata=metadata, doc_id=doc_id)

        await memory_event_store.append(
            doc_id,
            MEMORY_CREATED,
            actor,
            {"memory_type": memory_type.value, "text_len": len(text)},
        )

        return MemoryObject(
            id=doc_id,
            text=text,
            memory_type=memory_type,
            importance_score=0.5,
            confirmation_state=ConfirmationState.PENDING,
            user_id=user_id,
            session_id=session_id,
            created_at=now.isoformat(),
            expires_at=None,
            tags=tags or [],
            source=source,
        )

    async def score(
        self,
        memory_id: str,
        score: float,
        reason: str = "",
        actor: str = "system",
    ) -> None:
        doc = knowledge_store.get_by_id(memory_id)
        if doc is None:
            return
        metadata = dict(doc.get("metadata") or {})
        metadata["importance_score"] = score
        knowledge_store.add(text=doc["text"], metadata=metadata, doc_id=memory_id)
        await memory_event_store.append(
            memory_id, MEMORY_SCORED, actor, {"score": score, "reason": reason}
        )

    async def promote(self, memory_id: str, actor: str = "policy") -> None:
        doc = knowledge_store.get_by_id(memory_id)
        if doc is None:
            return
        metadata = dict(doc.get("metadata") or {})
        metadata["expires_at"] = None
        knowledge_store.add(text=doc["text"], metadata=metadata, doc_id=memory_id)
        await memory_event_store.append(memory_id, MEMORY_PROMOTED, actor)

    async def demote(self, memory_id: str, actor: str = "policy") -> None:
        doc = knowledge_store.get_by_id(memory_id)
        if doc is None:
            return
        metadata = dict(doc.get("metadata") or {})
        expires = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        metadata["expires_at"] = expires
        knowledge_store.add(text=doc["text"], metadata=metadata, doc_id=memory_id)
        await memory_event_store.append(memory_id, MEMORY_DEMOTED, actor)

    async def confirm(self, memory_id: str, actor: str = "user") -> None:
        doc = knowledge_store.get_by_id(memory_id)
        if doc is None:
            return
        metadata = dict(doc.get("metadata") or {})
        metadata["confirmation_state"] = ConfirmationState.CONFIRMED.value
        knowledge_store.add(text=doc["text"], metadata=metadata, doc_id=memory_id)
        await memory_event_store.append(memory_id, MEMORY_CONFIRMED, actor)

    async def reject(self, memory_id: str, actor: str = "user") -> None:
        doc = knowledge_store.get_by_id(memory_id)
        if doc is None:
            return
        metadata = dict(doc.get("metadata") or {})
        metadata["confirmation_state"] = ConfirmationState.REJECTED.value
        knowledge_store.add(text=doc["text"], metadata=metadata, doc_id=memory_id)
        await memory_event_store.append(memory_id, MEMORY_REJECTED, actor)

    async def expire_due(self) -> int:
        results = knowledge_store.search("memory", n_results=1000)
        now = datetime.now(timezone.utc)
        count = 0
        for doc in results:
            meta = doc.get("metadata") or {}
            expires_at = meta.get("expires_at")
            if not expires_at:
                continue
            try:
                exp_dt = datetime.fromisoformat(expires_at)
                # Make aware if naive
                if exp_dt.tzinfo is None:
                    exp_dt = exp_dt.replace(tzinfo=timezone.utc)
                if exp_dt < now:
                    knowledge_store.delete(doc["id"])
                    await memory_event_store.append(doc["id"], MEMORY_EXPIRED, "system")
                    count += 1
            except Exception:
                pass
        return count

    async def retrieve(
        self,
        query: str,
        user_id: str | None,
        memory_types: list[MemoryType] | None = None,
        min_score: float = 0.0,
        limit: int = 10,
    ) -> list[MemoryObject]:
        ns = _namespace(user_id, None)
        results = knowledge_store.search(query, n_results=limit * 3)
        objects: list[MemoryObject] = []
        for doc in results:
            meta = doc.get("metadata") or {}
            if meta.get("namespace") != ns:
                continue
            imp = float(meta.get("importance_score", 0.5))
            if imp < min_score:
                continue
            try:
                mt = MemoryType(meta.get("memory_type", MemoryType.SEMANTIC.value))
            except ValueError:
                mt = MemoryType.SEMANTIC
            if memory_types and mt not in memory_types:
                continue
            tags_raw = meta.get("tags", "[]")
            try:
                tags = json.loads(tags_raw) if isinstance(tags_raw, str) else (tags_raw or [])
            except Exception:
                tags = []
            try:
                cs = ConfirmationState(meta.get("confirmation_state", "pending"))
            except ValueError:
                cs = ConfirmationState.PENDING
            objects.append(
                MemoryObject(
                    id=doc["id"],
                    text=doc["text"],
                    memory_type=mt,
                    importance_score=imp,
                    confirmation_state=cs,
                    user_id=meta.get("user_id"),
                    session_id=meta.get("session_id"),
                    created_at=meta.get("extracted_at", ""),
                    expires_at=meta.get("expires_at"),
                    tags=tags,
                    source=meta.get("source", "chat"),
                )
            )
            if len(objects) >= limit:
                break
        return objects


universal_memory = UniversalMemoryService()
