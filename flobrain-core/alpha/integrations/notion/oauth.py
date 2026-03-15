from __future__ import annotations

import base64
import logging
from typing import Any

import httpx

from config.settings import settings

logger = logging.getLogger(__name__)

NOTION_AUTH_URL = "https://api.notion.com/v1/oauth/authorize"
NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token"


class NotionOAuthError(Exception):
    pass


class NotionOAuth:
    """
    Handles the Notion OAuth 2.0 flow.

    To use multi-user OAuth you must set:
      NOTION_CLIENT_ID, NOTION_CLIENT_SECRET, NOTION_REDIRECT_URI
    in your environment / .env file.
    """

    def __init__(
        self,
        client_id: str | None = None,
        client_secret: str | None = None,
        redirect_uri: str | None = None,
    ) -> None:
        self.client_id = client_id or settings.NOTION_CLIENT_ID
        self.client_secret = client_secret or settings.NOTION_CLIENT_SECRET
        self.redirect_uri = redirect_uri or settings.NOTION_REDIRECT_URI

    def _require_credentials(self) -> None:
        if not self.client_id or not self.client_secret:
            raise NotionOAuthError(
                "NOTION_CLIENT_ID and NOTION_CLIENT_SECRET must be set for OAuth."
            )

    def get_auth_url(self, state: str = "") -> str:
        """Return the URL the user should be redirected to for authorization."""
        self._require_credentials()
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "owner": "user",
        }
        if state:
            params["state"] = state

        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{NOTION_AUTH_URL}?{query}"

    async def exchange_code(self, code: str) -> dict[str, Any]:
        """
        Exchange an authorization code for an access token.

        Returns the full token response from Notion, including:
          access_token, token_type, bot_id, workspace_id, workspace_name,
          workspace_icon, owner, duplicated_template_id
        """
        self._require_credentials()

        credentials = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                NOTION_TOKEN_URL,
                headers={
                    "Authorization": f"Basic {credentials}",
                    "Content-Type": "application/json",
                    "Notion-Version": "2022-06-28",
                },
                json={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                },
            )

        if not resp.is_success:
            raise NotionOAuthError(f"Token exchange failed ({resp.status_code}): {resp.text}")

        return resp.json()

    async def refresh_token(self, refresh_token: str) -> dict[str, Any]:
        """
        Refresh an access token.

        Note: As of mid-2024 Notion's OAuth tokens do not expire and there is
        no refresh token mechanism.  This method is provided as a scaffold for
        forward-compatibility.
        """
        # Notion does not currently issue expiring tokens; this is a scaffold.
        raise NotionOAuthError(
            "Notion OAuth tokens do not expire. Refresh is not supported."
        )


# Module-level singleton
notion_oauth = NotionOAuth()
