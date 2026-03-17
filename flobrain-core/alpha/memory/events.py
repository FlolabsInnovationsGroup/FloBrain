from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select

from db.database import AsyncSessionLocal
from db.models import MemoryEventModel  # defined in db/models.py

# ---------------------------------------------------------------------------
# Event type constants
# ---------------------------------------------------------------------------

MEMORY_CREATED = "MEMORY_CREATED"
MEMORY_TYPED = "MEMORY_TYPED"
MEMORY_SCORED = "MEMORY_SCORED"
MEMORY_PROMOTED = "MEMORY_PROMOTED"
MEMORY_DEMOTED = "MEMORY_DEMOTED"
MEMORY_CONFIRMED = "MEMORY_CONFIRMED"
MEMORY_REJECTED = "MEMORY_REJECTED"
MEMORY_EXPIRED = "MEMORY_EXPIRED"
MEMORY_DELETED = "MEMORY_DELETED"


class MemoryEventStore:
    async def append(
        self,
        memory_id: str,
        event_type: str,
        actor: str,
        payload: dict | None = None,
    ) -> Any:
        async with AsyncSessionLocal() as db:
            event = MemoryEventModel(
                id=str(uuid.uuid4()),
                memory_id=memory_id,
                event_type=event_type,
                actor=actor,
                payload=payload or {},
                created_at=datetime.now(timezone.utc),
            )
            db.add(event)
            await db.commit()
            await db.refresh(event)
            return event

    async def get_history(self, memory_id: str) -> list[Any]:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(MemoryEventModel)
                .where(MemoryEventModel.memory_id == memory_id)
                .order_by(MemoryEventModel.created_at)
            )
            return result.scalars().all()


memory_event_store = MemoryEventStore()
