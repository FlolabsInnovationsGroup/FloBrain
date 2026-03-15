from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select

from db.database import AsyncSessionLocal
from db.models import Message, Session
from memory.store import memory_store

logger = logging.getLogger(__name__)


class ConversationMemory:
    """
    Manages per-session conversation history.

    Persists messages to SQLite (always) and optionally adds them to the
    vector store so they can be retrieved semantically in future sessions.
    """

    async def get_or_create_session(
        self, session_id: str | None = None, user_id: str | None = None, title: str = "New Conversation"
    ) -> str:
        """Return an existing session id or create a new one."""
        async with AsyncSessionLocal() as db:
            if session_id:
                result = await db.execute(select(Session).where(Session.id == session_id))
                session = result.scalar_one_or_none()
                if session:
                    return session.id

            # Create new session
            new_session = Session(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=title,
            )
            db.add(new_session)
            await db.commit()
            await db.refresh(new_session)
            return new_session.id

    async def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> str:
        """Persist a message and index it in the vector store."""
        msg_id = str(uuid.uuid4())
        async with AsyncSessionLocal() as db:
            msg = Message(
                id=msg_id,
                session_id=session_id,
                role=role,
                content=content,
                message_metadata=metadata or {},
            )
            db.add(msg)

            # Update session updated_at
            result = await db.execute(select(Session).where(Session.id == session_id))
            session = result.scalar_one_or_none()
            if session:
                session.updated_at = datetime.now(timezone.utc)

            await db.commit()

        # Index in vector store (non-critical)
        try:
            memory_store.add(
                text=f"[{role}] {content}",
                metadata={"session_id": session_id, "role": role, "msg_id": msg_id},
                doc_id=msg_id,
            )
        except Exception as exc:
            logger.debug("Failed to index message in vector store: %s", exc)

        return msg_id

    async def get_history(
        self, session_id: str, limit: int = 20
    ) -> list[dict[str, Any]]:
        """Return the last `limit` messages for a session as plain dicts."""
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Message)
                .where(Message.session_id == session_id)
                .order_by(Message.created_at.desc())
                .limit(limit)
            )
            messages = list(reversed(result.scalars().all()))

        return [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
                "metadata": msg.message_metadata or {},
            }
            for msg in messages
        ]

    async def search_similar(
        self, query: str, session_id: str | None = None, n_results: int = 5
    ) -> list[dict[str, Any]]:
        """Semantic search across conversation history."""
        results = memory_store.search(query, n_results=n_results * 2)
        if session_id:
            results = [r for r in results if r.get("metadata", {}).get("session_id") == session_id]
        return results[:n_results]

    async def clear(self, session_id: str) -> None:
        """Delete all messages in a session from SQL (vector store cleanup is best-effort)."""
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Message).where(Message.session_id == session_id))
            for msg in result.scalars().all():
                try:
                    memory_store.delete(msg.id)
                except Exception:
                    pass
                await db.delete(msg)
            await db.commit()


# Module-level singleton
conversation_memory = ConversationMemory()
