from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from db.database import init_db

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s v%s", settings.APP_NAME, settings.VERSION)
    await init_db()
    logger.info("Database tables ready.")
    yield
    logger.info("Shutting down %s.", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="FloBrain — AI backend for the CAIPO wearable assistant by FloLabs.",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

from api.routes import audio, auth, chat, health  # noqa: E402
from api.routes.integrations import notion_oauth_router, router as integrations_router  # noqa: E402

app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(audio.router, prefix="/api/v1/audio", tags=["Audio"])
app.include_router(integrations_router, prefix="/api/v1/integrations", tags=["Integrations"])

# Notion OAuth at /auth/notion/connect and /auth/notion/callback
app.include_router(notion_oauth_router, prefix="/auth/notion", tags=["Notion OAuth"])


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
