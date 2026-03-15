from __future__ import annotations

import logging
from typing import Any

from agents.tools.base import Tool
from config.settings import settings
from integrations.notion.client import NotionClient, notion_client

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------


async def _notion_search(query: str, filter_type: str | None = None) -> list[dict[str, Any]]:
    """Search the Notion workspace."""
    results = await notion_client.search(query, filter_type=filter_type)
    # Simplify results for LLM consumption
    simplified = []
    for item in results[:10]:
        obj_type = item.get("object", "")
        obj_id = item.get("id", "")
        title = ""
        if obj_type == "page":
            title = notion_client.extract_text_from_page(item)[:200]
        simplified.append(
            {
                "id": obj_id,
                "type": obj_type,
                "title": title or obj_id,
                "url": item.get("url", ""),
            }
        )
    return simplified


async def _notion_read_page(page_id: str, include_blocks: bool = True) -> dict[str, Any]:
    """Read a Notion page and its block children."""
    page = await notion_client.get_page(page_id)
    text = notion_client.extract_text_from_page(page)

    result: dict[str, Any] = {
        "id": page_id,
        "url": page.get("url", ""),
        "properties_text": text,
        "blocks": [],
    }

    if include_blocks:
        blocks = await notion_client.get_block_children(page_id)
        result["blocks"] = notion_client.extract_text_from_blocks(blocks)

    return result


async def _notion_query_tasks(
    status_filter: str | None = None,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """Query the Tasks Notion database."""
    db_id = settings.NOTION_TASKS_DB_ID
    if not db_id:
        raise ValueError("NOTION_TASKS_DB_ID is not configured.")

    notion_filter: dict | None = None
    if status_filter:
        notion_filter = {
            "property": "Status",
            "status": {"equals": status_filter},
        }

    pages = await notion_client.query_database(db_id, filter=notion_filter, page_size=limit)
    return [
        {
            "id": p.get("id"),
            "url": p.get("url"),
            "text": notion_client.extract_text_from_page(p),
        }
        for p in pages
    ]


async def _notion_query_projects(
    status_filter: str | None = None,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """Query the Projects Notion database."""
    db_id = settings.NOTION_PROJECTS_DB_ID
    if not db_id:
        raise ValueError("NOTION_PROJECTS_DB_ID is not configured.")

    notion_filter: dict | None = None
    if status_filter:
        notion_filter = {
            "property": "Status",
            "status": {"equals": status_filter},
        }

    pages = await notion_client.query_database(db_id, filter=notion_filter, page_size=limit)
    return [
        {
            "id": p.get("id"),
            "url": p.get("url"),
            "text": notion_client.extract_text_from_page(p),
        }
        for p in pages
    ]


# ---------------------------------------------------------------------------
# Tool definitions
# ---------------------------------------------------------------------------

notion_search = Tool(
    name="notion_search",
    description="Search the connected Notion workspace for pages and databases matching a query.",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "The search query."},
            "filter_type": {
                "type": "string",
                "enum": ["page", "database"],
                "description": "Optionally restrict results to pages or databases.",
            },
        },
        "required": ["query"],
    },
    function=_notion_search,
)

notion_read_page = Tool(
    name="notion_read_page",
    description="Read the full content of a specific Notion page by its ID.",
    parameters={
        "type": "object",
        "properties": {
            "page_id": {"type": "string", "description": "The Notion page ID (UUID)."},
            "include_blocks": {
                "type": "boolean",
                "description": "Whether to include block content (default true).",
                "default": True,
            },
        },
        "required": ["page_id"],
    },
    function=_notion_read_page,
)

notion_query_tasks = Tool(
    name="notion_query_tasks",
    description="Query the Tasks database in Notion. Optionally filter by status.",
    parameters={
        "type": "object",
        "properties": {
            "status_filter": {
                "type": "string",
                "description": "Filter tasks by status value (e.g. 'In Progress', 'Done').",
            },
            "limit": {
                "type": "integer",
                "description": "Maximum number of tasks to return (default 20).",
                "default": 20,
            },
        },
        "required": [],
    },
    function=_notion_query_tasks,
)

notion_query_projects = Tool(
    name="notion_query_projects",
    description="Query the Projects database in Notion. Optionally filter by status.",
    parameters={
        "type": "object",
        "properties": {
            "status_filter": {
                "type": "string",
                "description": "Filter projects by status value.",
            },
            "limit": {
                "type": "integer",
                "description": "Maximum number of projects to return (default 20).",
                "default": 20,
            },
        },
        "required": [],
    },
    function=_notion_query_projects,
)

ALL_NOTION_TOOLS: list[Tool] = [
    notion_search,
    notion_read_page,
    notion_query_tasks,
    notion_query_projects,
]
