# File: app/main.py

import logging
import time 
import uuid 
from fastapi import FastAPI, Request 
from fastapi import FastAPI
from app.core.config import get_settings
from app.api.v1.api import api_router
from app.db.database import create_db_and_tables 

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
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware to log request details including a unique ID and latency.
    """
    request_id = str(uuid.uuid4())
    logger.info(f"Request started | id={request_id} method={request.method} path={request.url.path}")
    
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000  # in milliseconds

    logger.info(
        f"Request finished | id={request_id} method={request.method} path={request.url.path} "
        f"status_code={response.status_code} latency={process_time:.2f}ms"
    )
    
    # Add the request ID to the response headers so it can be tracked in the client/browser
    response.headers["X-Request-ID"] = request_id
    return response
# --- END MIDDLEWARE ---

# Include the main API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    logger.info("Application startup complete.")
    create_db_and_tables() 
    logger.info(f"API documentation available at http://127.0.0.1:8000{app.docs_url}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down.")

# A simple root endpoint for a basic check
@app.get("/", tags=["Root"])
def read_root():
    return {"message": f"Welcome to {settings.APP_NAME}"}