from __future__ import annotations

import json
import logging
import re

from memory.universal import MemoryType, universal_memory, MemoryObject
from services.llm import llm_service

logger = logging.getLogger(__name__)

# Keywords that raise importance
HIGH_IMPORTANCE_PATTERNS = [
    r'\bmy name is\b', r'\bi am\b', r'\bi work\b', r'\bi live\b',
    r'\bmy goal\b', r'\bi prefer\b', r'\bi want\b', r'\bremind me\b',
    r'\bdeadline\b', r'\bbirthday\b', r'\baddress\b', r'\bphone\b',
    r'\bemail\b', r'\bpassword\b', r'\balways\b', r'\bnever\b',
]

# Patterns that indicate low-importance filler
LOW_IMPORTANCE_PATTERNS = [
    r'^(ok|okay|sure|yes|no|yep|nope|thanks|thank you|got it|understood|alright|cool|great|nice)[\s.!]*$',
]


class MemoryIntelligence:
    def score_importance(self, text: str, context: str = '') -> float:
        t = text.strip().lower()
        # Short filler
        if len(t) < 20:
            for pat in LOW_IMPORTANCE_PATTERNS:
                if re.match(pat, t):
                    return 0.1
            return 0.3
        # High-signal keywords
        for pat in HIGH_IMPORTANCE_PATTERNS:
            if re.search(pat, t):
                return 0.85
        # Ambiguous range — use LLM (sync wrapper calling async in background)
        return 0.5  # default for ambiguous; LLM scoring done in async version

    async def score_importance_async(self, text: str, context: str = '') -> float:
        """Async version — calls LLM for ambiguous cases."""
        sync_score = self.score_importance(text, context)
        if 0.3 <= sync_score <= 0.7:
            # Only call LLM for ambiguous range
            try:
                prompt = f'Rate importance 0.0-1.0 for storing as long-term memory: "{text[:300]}". Return JSON only: {{"score": 0.0, "reason": ""}}'
                messages = [{"role": "user", "content": prompt}]
                raw = await llm_service.chat(messages, stream=False)
                assert isinstance(raw, str)
                # Strip markdown fences
                clean = raw.strip().strip('`').lstrip('json').strip()
                data = json.loads(clean)
                return float(data.get("score", sync_score))
            except Exception as exc:
                logger.debug("LLM importance scoring failed: %s", exc)
        return sync_score

    async def classify_type(self, text: str) -> MemoryType:
        """Classify text into a MemoryType using LLM."""
        try:
            prompt = (
                f'Classify this memory into exactly one type. Text: "{text[:300]}"\n'
                'Types: EPISODIC (what happened at a time), SEMANTIC (facts/knowledge), '
                'PREFERENCE (likes/dislikes/constraints), PROCEDURAL (how to do things), '
                'TASK (actionable item with state), SYSTEM (system/meta info).\n'
                'Return JSON only: {"type": "SEMANTIC", "reason": ""}'
            )
            messages = [{"role": "user", "content": prompt}]
            raw = await llm_service.chat(messages, stream=False)
            assert isinstance(raw, str)
            clean = raw.strip().strip('`').lstrip('json').strip()
            data = json.loads(clean)
            type_str = str(data.get("type", "SEMANTIC")).upper()
            return MemoryType(type_str)
        except Exception as exc:
            logger.debug("MemoryIntelligence.classify_type failed: %s", exc)
            return MemoryType.SEMANTIC

    async def chunk_and_store(
        self,
        long_text: str,
        user_id: str | None,
        session_id: str | None,
        source: str = "chat",
    ) -> list[MemoryObject]:
        """Split long text into overlapping chunks and store each."""
        CHUNK_SIZE = 400
        OVERLAP = 80
        results: list[MemoryObject] = []

        if len(long_text) <= 500:
            chunks = [long_text]
        else:
            chunks = []
            start = 0
            while start < len(long_text):
                end = start + CHUNK_SIZE
                chunks.append(long_text[start:end])
                start += CHUNK_SIZE - OVERLAP
                if start >= len(long_text):
                    break

        for chunk in chunks:
            chunk = chunk.strip()
            if not chunk:
                continue
            try:
                score = await self.score_importance_async(chunk)
                m_type = await self.classify_type(chunk)
                obj = await universal_memory.create(
                    text=chunk,
                    memory_type=m_type,
                    actor="system",
                    user_id=user_id,
                    session_id=session_id,
                    source=source,
                )
                await universal_memory.score(obj.id, score, reason="auto-scored")
                results.append(obj)
            except Exception as exc:
                logger.debug("chunk_and_store failed for chunk: %s", exc)

        return results


memory_intelligence = MemoryIntelligence()
