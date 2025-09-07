# File: app/api/v1/api.py

from fastapi import APIRouter
from app.api.v1.endpoints import health, upload, status 

api_router = APIRouter()

# Include endpoint routers here
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(upload.router, prefix="/upload", tags=["Uploads"])
api_router.include_router(status.router, prefix="/status", tags=["Status"]) 