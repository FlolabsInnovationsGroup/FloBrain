from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query

from api.schemas import IntegrationStatusResponse
from config.settings import settings
from integrations.notion.client import notion_client
from integrations.notion.oauth import NotionOAuthError, notion_oauth

logger = logging.getLogger(__name__)

router = APIRouter()
notion_oauth_router = APIRouter()


# ---------------------------------------------------------------------------
# Integration status
# ---------------------------------------------------------------------------


@router.get("/notion/status", response_model=IntegrationStatusResponse)
async def notion_status() -> IntegrationStatusResponse:
    """Check whether the Notion integration is configured and reachable."""
    if not settings.NOTION_TOKEN:
        return IntegrationStatusResponse(
            name="notion",
            connected=False,
            message="NOTION_TOKEN is not configured.",
        )
    try:
        # Try a lightweight search to verify the token works
        await notion_client.search("", filter_type=None)
        return IntegrationStatusResponse(
            name="notion",
            connected=True,
            message="Notion is connected.",
        )
    except Exception as exc:
        return IntegrationStatusResponse(
            name="notion",
            connected=False,
            message=str(exc),
        )


# ---------------------------------------------------------------------------
# Notion OAuth scaffold
# (mount at /auth/notion via notion_oauth_router)
# ---------------------------------------------------------------------------


@notion_oauth_router.get("/connect")
async def notion_oauth_connect(state: str = Query(default="")) -> dict:
    """
    Redirect the user to Notion's OAuth authorization page.

    Requires NOTION_CLIENT_ID and NOTION_CLIENT_SECRET to be set.
    """
    try:
        url = notion_oauth.get_auth_url(state=state)
        return {"auth_url": url}
    except NotionOAuthError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@notion_oauth_router.get("/callback")
async def notion_oauth_callback(code: str = Query(...), state: str = Query(default="")) -> dict:
    """
    Handle the Notion OAuth callback and exchange the code for a token.

    In a production system you would store the token per-user in the database.
    For the alpha this simply returns the token data.
    """
    try:
        token_data = await notion_oauth.exchange_code(code)
        return {
            "message": "Notion OAuth connected successfully.",
            "workspace_name": token_data.get("workspace_name", ""),
            "workspace_id": token_data.get("workspace_id", ""),
            # Do NOT return the access_token in a real production system
            # unless over HTTPS and stored securely.
        }
    except NotionOAuthError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
