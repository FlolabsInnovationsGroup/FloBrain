from __future__ import annotations

import os
from collections.abc import AsyncGenerator
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from config.settings import settings


def _ensure_data_dir() -> None:
    """Ensure the data directory exists for the SQLite file."""
    db_url = settings.SQLITE_URL
    # Extract file path from sqlite+aiosqlite:///./data/flobrain.db
    if ":///" in db_url:
        db_path = db_url.split("///", 1)[1]
        if db_path and not db_path.startswith(":"):
            parent = Path(db_path).parent
            parent.mkdir(parents=True, exist_ok=True)


_ensure_data_dir()

engine = create_async_engine(
    settings.SQLITE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False},
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that provides an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables defined in models."""
    # Import models here so they are registered with Base
    from db import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
