# File: app/api/v1/endpoints/health.py

from fastapi import APIRouter

router = APIRouter()

@router.get("z", status_code=200)
def health_check():
    """
    Simple health check endpoint.
    Responds with a 200 OK status if the service is up.
    'z' is often used (e.g., /healthz) as it's unlikely to conflict with other endpoints.
    """
    return {"status": "ok"}