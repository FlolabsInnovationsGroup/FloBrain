"""
UserMemoryExtractor — post-response background service that extracts and
persists facts about the user from conversation exchanges.

Flow
----
1. After every assistant reply, ``extract_and_store`` is called as an
   asyncio background task (fire-and-forget, never blocks the response).
2. An LLM call analyses the latest user message (+ optional assistant
   reply) and returns a JSON list of facts.
3. Each fact is upserted into ``knowledge_store`` under the namespace
   ``user_memory:<user_id>``.  Anonymous sessions use ``user_memory:anon:<session_id>``.
4. ``get_user_context`` retrieves the most relevant facts for injection
   into the system prompt before each LLM call.
"""
from __future__ import annotations

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from memory.store import knowledge_store
from services.llm import llm_service

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Prompt used to extract user facts
# ---------------------------------------------------------------------------

_EXTRACTION_SYSTEM = """\
You are a memory extraction assistant.
Your job is to identify facts about the USER from the conversation exchange below.
Only extract facts that are explicitly stated or strongly implied by the user.
Do NOT invent or assume facts.

Return ONLY a JSON array of strings — each string is one concise fact.
If there are no facts to extract, return an empty array: []

Examples of good facts:
- "User's name is Sarah"
- "User works as a software engineer"
- "User prefers concise answers"
- "User is building a mobile app in React Native"
- "User is based in Paris"
- "User wants to be reminded about their 3pm meeting"

Do not include facts about the assistant, system, or general world knowledge.
"""

_EXTRACTION_USER_TEMPLATE = """\
User message: {user_message}

Assistant reply: {assistant_reply}

Extract facts about the user from the above exchange.
"""


class UserMemoryExtractor:
    """
    Extracts and stores user facts as a post-response background task.
    """

    def __init__(self) -> None:
        self._llm = llm_service

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def schedule_extraction(
        self,
        user_message: str,
        assistant_reply: str,
        user_id: str | None = None,
        session_id: str | None = None,
    ) -> None:
        """
        Fire-and-forget: schedule fact extraction in the background.
        Safe to call from any async context — never raises, never blocks.
        """
        asyncio.ensure_future(
            self._safe_extract(
                user_message=user_message,
                assistant_reply=assistant_reply,
                user_id=user_id,
                session_id=session_id,
            )
        )

    async def get_user_context(
        self,
        query: str,
        user_id: str | None = None,
        session_id: str | None = None,
        n_results: int = 6,
    ) -> str:
        """
        Retrieve the most relevant user facts for the current query.

        Returns a formatted string ready to inject into a system prompt,
        or an empty string when no facts are stored yet.
        """
        namespace = _namespace(user_id, session_id)
        try:
            results = knowledge_store.search(query, n_results=n_results * 2)
            # Filter to this user's namespace
            relevant = [
                r for r in results
                if r.get("metadata", {}).get("namespace") == namespace
            ][:n_results]

            if not relevant:
                return ""

            facts = [r["text"] for r in relevant]
            formatted = "\n".join(f"- {f}" for f in facts)
            return f"## What I know about you\n{formatted}"
        except Exception as exc:
            logger.debug("get_user_context failed: %s", exc)
            return ""

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    async def _safe_extract(
        self,
        user_message: str,
        assistant_reply: str,
        user_id: str | None,
        session_id: str | None,
    ) -> None:
        """Wrapper that swallows all exceptions so background task never crashes."""
        try:
            await self._extract_and_store(
                user_message=user_message,
                assistant_reply=assistant_reply,
                user_id=user_id,
                session_id=session_id,
            )
        except Exception as exc:
            logger.debug("UserMemoryExtractor background task failed: %s", exc)

    async def _extract_and_store(
        self,
        user_message: str,
        assistant_reply: str,
        user_id: str | None,
        session_id: str | None,
    ) -> list[str]:
        """
        Run the LLM extraction call and persist facts.
        Returns the list of extracted fact strings (useful for testing).
        """
        namespace = _namespace(user_id, session_id)

        prompt = _EXTRACTION_USER_TEMPLATE.format(
            user_message=user_message,
            assistant_reply=assistant_reply,
        )
        messages = [
            {"role": "system", "content": _EXTRACTION_SYSTEM},
            {"role": "user", "content": prompt},
        ]

        raw = await self._llm.chat(messages, stream=False)
        assert isinstance(raw, str)

        facts = _parse_facts(raw)
        if not facts:
            logger.debug("No user facts extracted for namespace=%s", namespace)
            return []

        stored: list[str] = []
        for fact in facts:
            fact = fact.strip()
            if not fact:
                continue
            doc_id = str(uuid.uuid4())
            metadata: dict[str, Any] = {
                "namespace": namespace,
                "extracted_at": datetime.now(timezone.utc).isoformat(),
                "source": "conversation",
            }
            if user_id:
                metadata["user_id"] = user_id
            if session_id:
                metadata["session_id"] = session_id

            knowledge_store.add(text=fact, metadata=metadata, doc_id=doc_id)
            stored.append(fact)

        logger.info(
            "UserMemory: stored %d fact(s) for namespace=%s", len(stored), namespace
        )
        return stored


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _namespace(user_id: str | None, session_id: str | None) -> str:
    if user_id:
        return f"user_memory:{user_id}"
    if session_id:
        return f"user_memory:anon:{session_id}"
    return "user_memory:anon"


def _parse_facts(raw: str) -> list[str]:
    """
    Parse the LLM output as a JSON array of strings.
    Robust to markdown code fences and minor formatting noise.
    """
    text = raw.strip()
    # Strip optional markdown code fences
    for fence in ("```json", "```"):
        if text.startswith(fence):
            text = text[len(fence):]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    # Find the first '[' and last ']' to be safe
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1 or end <= start:
        logger.debug("UserMemory: could not locate JSON array in LLM output: %r", raw[:200])
        return []

    try:
        parsed = json.loads(text[start : end + 1])
        if isinstance(parsed, list):
            return [str(item) for item in parsed if item]
    except json.JSONDecodeError as exc:
        logger.debug("UserMemory: JSON parse failed: %s | raw=%r", exc, raw[:200])

    return []


# Module-level singleton
user_memory_extractor = UserMemoryExtractor()
