from __future__ import annotations

import asyncio
import time

from fastapi import APIRouter

from config.settings import settings
from services.llm import llm_service
from services.embeddings import embeddings_service

router = APIRouter()

_start_time = time.time()


async def _check_llm() -> dict:
    t0 = time.monotonic()
    try:
        result = await asyncio.wait_for(llm_service.health_check(), timeout=2.0)
        latency = round((time.monotonic() - t0) * 1000, 1)
        if result.get("available"):
            return {"status": "ok", "model": llm_service.ollama_model, "latency_ms": latency}
        return {"status": "unavailable", "model": llm_service.ollama_model, "latency_ms": latency}
    except asyncio.TimeoutError:
        return {"status": "timeout", "model": llm_service.ollama_model, "latency_ms": None}
    except Exception as exc:
        return {"status": "error", "model": llm_service.ollama_model, "latency_ms": None, "detail": str(exc)}


async def _check_database() -> dict:
    try:
        from db.database import AsyncSessionLocal
        from sqlalchemy import text as sa_text
        async with AsyncSessionLocal() as db:
            result = await asyncio.wait_for(
                db.execute(sa_text("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")),
                timeout=2.0,
            )
            table_count = result.scalar() or 0
        return {"status": "ok", "tables": table_count}
    except Exception as exc:
        return {"status": "error", "tables": 0, "detail": str(exc)}


async def _check_vector_store() -> dict:
    try:
        from memory.store import knowledge_store
        knowledge_store._init()
        if knowledge_store._using_chroma and knowledge_store._chroma_collection is not None:
            client = knowledge_store._chroma_collection._client
            collections = len(client.list_collections())
            doc_count = knowledge_store._chroma_collection.count()
            return {"status": "ok", "collections": collections, "documents": doc_count}
        return {"status": "unavailable", "collections": 0, "documents": 0}
    except Exception as exc:
        return {"status": "error", "collections": 0, "documents": 0, "detail": str(exc)}


async def _check_transcription() -> dict:
    try:
        import faster_whisper  # noqa
        return {"status": "ok", "available": True}
    except ImportError:
        return {"status": "unavailable", "available": False}


@router.get("/health")
async def health_check() -> dict:
    from api.middleware.logging import get_request_count

    llm, db, vs, transcription = await asyncio.gather(
        _check_llm(),
        _check_database(),
        _check_vector_store(),
        _check_transcription(),
        return_exceptions=False,
    )

    # Judge status
    try:
        judge_enabled = settings.JUDGE_ENABLED
    except AttributeError:
        judge_enabled = False

    # Memory intelligence status
    try:
        from memory.intelligence import memory_intelligence  # noqa
        mi_available = True
    except ImportError:
        mi_available = False

    # Overall status
    if db.get("status") == "error":
        overall = "down"
    elif llm.get("status") == "unavailable":
        overall = "degraded"
    else:
        overall = "ok"

    return {
        "status": overall,
        "version": settings.VERSION,
        "uptime_seconds": round(time.time() - _start_time, 1),
        "request_count": get_request_count(),
        "components": {
            "llm": llm,
            "database": db,
            "vector_store": vs,
            "embeddings": {
                "status": "ok",
                "model": "all-MiniLM-L6-v2",
                "neural": embeddings_service.is_neural,
            },
            "transcription": transcription,
            "judge": {
                "status": "ok",
                "enabled": judge_enabled,
            },
            "memory_intelligence": {
                "status": "ok",
                "available": mi_available,
            },
        },
    }
