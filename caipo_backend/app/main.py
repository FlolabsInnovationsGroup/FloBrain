# File: app/main.py

import logging
from fastapi import FastAPI
from app.core.config import get_settings
from app.api.v1.api import api_router

# Initialize settings and logger
settings = get_settings()
logger = logging.getLogger(__name__)

logger.info("Initializing CAIPO Backend Application...")

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Backend service for the CAIPO prototype.",
    version="0.1.0",
)

# Include the main API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    logger.info("Application startup complete.")
    logger.info(f"API documentation available at http://127.0.0.1:8000{app.docs_url}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down.")

# A simple root endpoint for a basic check
@app.get("/", tags=["Root"])
def read_root():
    return {"message": f"Welcome to {settings.APP_NAME}"}