from __future__ import annotations

import logging
from typing import Any

import httpx

from config.settings import settings

logger = logging.getLogger(__name__)

NOTION_API_BASE = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"


class NotionAPIError(Exception):
    def __init__(self, status: int, message: str) -> None:
        self.status = status
        super().__init__(f"Notion API error {status}: {message}")


class NotionClient:
    """
    Async Notion API client backed by httpx.

    The token is read from settings at construction time, but callers can
    supply a per-request token for multi-user OAuth scenarios.
    """

    def __init__(self, token: str | None = None) -> None:
        self._token = token or settings.NOTION_TOKEN

    def _headers(self) -> dict[str, str]:
        if not self._token:
            raise ValueError("NOTION_TOKEN is not set.")
        return {
            "Authorization": f"Bearer {self._token}",
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
        }

    async def _get(self, path: str, params: dict | None = None) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{NOTION_API_BASE}/{path.lstrip('/')}",
                headers=self._headers(),
                params=params or {},
            )
            if not resp.is_success:
                raise NotionAPIError(resp.status_code, resp.text)
            return resp.json()

    async def _post(self, path: str, body: dict | None = None) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{NOTION_API_BASE}/{path.lstrip('/')}",
                headers=self._headers(),
                json=body or {},
            )
            if not resp.is_success:
                raise NotionAPIError(resp.status_code, resp.text)
            return resp.json()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def search(self, query: str, filter_type: str | None = None) -> list[dict[str, Any]]:
        """Search across the workspace."""
        body: dict[str, Any] = {"query": query}
        if filter_type in ("page", "database"):
            body["filter"] = {"value": filter_type, "property": "object"}
        data = await self._post("search", body)
        return data.get("results", [])

    async def get_page(self, page_id: str) -> dict[str, Any]:
        """Retrieve a page object."""
        return await self._get(f"pages/{page_id}")

    async def get_database(self, database_id: str) -> dict[str, Any]:
        """Retrieve a database object."""
        return await self._get(f"databases/{database_id}")

    async def query_database(
        self,
        database_id: str,
        filter: dict | None = None,
        sorts: list[dict] | None = None,
        page_size: int = 50,
    ) -> list[dict[str, Any]]:
        """Query all pages in a database (handles pagination)."""
        body: dict[str, Any] = {"page_size": page_size}
        if filter:
            body["filter"] = filter
        if sorts:
            body["sorts"] = sorts

        results: list[dict] = []
        while True:
            data = await self._post(f"databases/{database_id}/query", body)
            results.extend(data.get("results", []))
            if not data.get("has_more"):
                break
            body["start_cursor"] = data.get("next_cursor")

        return results

    async def get_block_children(self, block_id: str) -> list[dict[str, Any]]:
        """Retrieve all children of a block (handles pagination)."""
        results: list[dict] = []
        params: dict[str, Any] = {}
        while True:
            data = await self._get(f"blocks/{block_id}/children", params)
            results.extend(data.get("results", []))
            if not data.get("has_more"):
                break
            params["start_cursor"] = data.get("next_cursor")
        return results

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def extract_text_from_page(self, page: dict[str, Any]) -> str:
        """
        Extract a readable text summary from a Notion page object.

        This works on the page object returned by get_page() / search() —
        it reads the title property and any rich_text fields.
        """
        parts: list[str] = []

        props = page.get("properties", {})
        for prop_name, prop_val in props.items():
            ptype = prop_val.get("type", "")
            if ptype == "title":
                text = self._extract_rich_text(prop_val.get("title", []))
                if text:
                    parts.append(f"# {text}")
            elif ptype == "rich_text":
                text = self._extract_rich_text(prop_val.get("rich_text", []))
                if text:
                    parts.append(f"{prop_name}: {text}")
            elif ptype == "select":
                sel = prop_val.get("select")
                if sel:
                    parts.append(f"{prop_name}: {sel.get('name', '')}")
            elif ptype == "multi_select":
                items = prop_val.get("multi_select", [])
                if items:
                    parts.append(f"{prop_name}: {', '.join(i.get('name', '') for i in items)}")
            elif ptype == "date":
                date_info = prop_val.get("date")
                if date_info:
                    start = date_info.get("start", "")
                    end = date_info.get("end", "")
                    date_str = start + (f" → {end}" if end else "")
                    parts.append(f"{prop_name}: {date_str}")
            elif ptype == "checkbox":
                parts.append(f"{prop_name}: {prop_val.get('checkbox', False)}")
            elif ptype == "url":
                url = prop_val.get("url", "")
                if url:
                    parts.append(f"{prop_name}: {url}")
            elif ptype == "email":
                email = prop_val.get("email", "")
                if email:
                    parts.append(f"{prop_name}: {email}")
            elif ptype == "number":
                num = prop_val.get("number")
                if num is not None:
                    parts.append(f"{prop_name}: {num}")
            elif ptype == "status":
                status = prop_val.get("status")
                if status:
                    parts.append(f"{prop_name}: {status.get('name', '')}")

        return "\n".join(parts)

    @staticmethod
    def _extract_rich_text(rich_text_list: list[dict]) -> str:
        return "".join(rt.get("plain_text", "") for rt in rich_text_list)

    def extract_text_from_blocks(self, blocks: list[dict[str, Any]]) -> str:
        """Convert a list of Notion block objects to plain text."""
        parts: list[str] = []
        for block in blocks:
            btype = block.get("type", "")
            block_data = block.get(btype, {})
            rich_text = block_data.get("rich_text", [])
            text = self._extract_rich_text(rich_text)
            if text:
                parts.append(text)
        return "\n".join(parts)


# Module-level singleton
notion_client = NotionClient()
