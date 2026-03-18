from __future__ import annotations

import hashlib
import json
import logging
from dataclasses import dataclass, field

from services.llm import llm_service

logger = logging.getLogger(__name__)


@dataclass
class NLUResult:
    intent: str
    entities: list[dict]  # each dict has "type" and "value" keys
    confidence: float
    raw_text: str

    def to_dict(self) -> dict:
        return {
            "intent": self.intent,
            "entities": self.entities,
            "confidence": self.confidence,
            "raw_text": self.raw_text,
        }


_FALLBACK = lambda text: NLUResult(intent="unknown", entities=[], confidence=0.0, raw_text=text)


class NLUService:
    def __init__(self, cache_size: int = 200) -> None:
        self._cache: dict[str, NLUResult] = {}
        self._cache_size = cache_size

    def _cache_key(self, text: str) -> str:
        return hashlib.md5(text.strip().lower()[:200].encode()).hexdigest()

    async def analyze(self, text: str) -> NLUResult:
        key = self._cache_key(text)
        if key in self._cache:
            return self._cache[key]

        try:
            prompt = (
                f'Analyze this user message and extract intent and entities.\n'
                f'Message: "{text[:400]}"\n'
                'Return JSON only (no markdown, no explanation):\n'
                '{"intent": "brief description of user intent", '
                '"entities": [{"type": "PERSON", "value": "Alice"}], '
                '"confidence": 0.9}'
            )
            messages = [{"role": "user", "content": prompt}]
            raw = await llm_service.chat(messages, stream=False)
            assert isinstance(raw, str)
            clean = raw.strip().strip('`').lstrip('json').strip()
            # Find JSON bounds
            start = clean.find('{')
            end = clean.rfind('}')
            if start == -1 or end == -1:
                return _FALLBACK(text)
            data = json.loads(clean[start:end + 1])
            result = NLUResult(
                intent=str(data.get("intent", "unknown")),
                entities=[e for e in data.get("entities", []) if isinstance(e, dict)],
                confidence=float(data.get("confidence", 0.5)),
                raw_text=text,
            )
        except Exception as exc:
            logger.debug("NLUService.analyze failed: %s", exc)
            result = _FALLBACK(text)

        # Cache with eviction
        if len(self._cache) >= self._cache_size:
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
        self._cache[key] = result
        return result


nlu_service = NLUService()
