"""
entity_extractor.py — Lightweight regex-based entity extraction.

Extracts entities (people, organizations, emails, phones, URLs, dates, etc.)
from text without requiring spaCy or LLM dependencies. Designed as a stub
that can be replaced by SuperMemory's entity extractor or a proper NER
model without changing the adapter interface.

Output entity schema:
    {
        "text": str,           # surface form as it appears in text
        "type": str,           # person | organization | email | phone | url | date | location | misc
        "start": int,          # char offset
        "end": int,            # char offset
        "normalized": str      # canonical form (e.g. lowercase for emails)
    }
"""
import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# High-precision regex patterns (low false positive rate)
_PATTERNS: List[tuple] = [
    ("email", re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')),
    ("url", re.compile(r'\bhttps?://[^\s<>"\']+[^\s<>"\'.!,;:)]')),
    ("phone", re.compile(r'\b\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b')),
    ("date_iso", re.compile(r'\b\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2})?\b')),
    ("date_eu", re.compile(r'\b\d{1,2}[./]\d{1,2}[./]\d{2,4}\b')),
    ("ip_address", re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')),
    ("hashtag", re.compile(r'#(\w+)')),
    ("mention", re.compile(r'@(\w+)')),
    # Currency amounts: $100, €1,234.56, £50
    ("money", re.compile(r'[$€£¥₽]\s?\d[\d,]*(?:\.\d{1,2})?')),
]

# Heuristic patterns for names and organizations (lower precision, requires context)
# Sequences of 2+ Capitalized Words (e.g. "Anna Smith", "Microsoft Corporation")
_CAP_SEQUENCE = re.compile(
    r'\b(?:[A-ZА-ЯЁ][a-zа-яё]+(?:[\s-][A-ZА-ЯЁ][a-zа-яё]+){1,4})\b'
)

# Organization suffixes (common in EN + RU)
_ORG_SUFFIXES = {
    'Inc', 'Corp', 'Corporation', 'Company', 'Co', 'LLC', 'Ltd', 'Limited',
    'GmbH', 'S.A.', 'AG', 'SA', 'Group', 'Holdings', 'Partners',
    'ООО', 'АО', 'ПАО', 'ЗАО', 'ИП', 'НКО', 'Фонд', 'Университет',
    'Institute', 'University', 'College', 'School', 'Lab', 'Labs',
}

# Common location indicators
_LOCATION_INDICATORS = {
    'City', 'River', 'Mountain', 'Lake', 'Ocean', 'Sea', 'Island',
    'Street', 'Avenue', 'Boulevard', 'Square', 'Park',
    'город', 'река', 'море', 'озеро', 'гора',
}

# Stopwords: words that look like capitalized sequences but aren't entities
_NAME_STOPWORDS = {
    'The', 'This', 'That', 'These', 'Those', 'And', 'But', 'Or', 'Not',
    'In', 'On', 'At', 'To', 'For', 'Of', 'With', 'From', 'By', 'I', 'A', 'An',
    'И', 'Но', 'Или', 'Не', 'В', 'На', 'При', 'Для', 'От', 'До', 'Я', 'А',
    'Сегодня', 'Вчера', 'Завтра', 'Today', 'Yesterday', 'Tomorrow',
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье',
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
    'HQ', 'CEO', 'CTO', 'CFO', 'COO', 'API', 'SDK', 'MCP', 'LLM', 'RAG',
}

# Single-word organizations (proper nouns commonly used alone)
_KNOWN_ORGS = {
    'Microsoft', 'Google', 'Apple', 'Amazon', 'Meta', 'Facebook', 'OpenAI',
    'Anthropic', 'Nvidia', 'Tesla', 'Twitter', 'X', 'GitHub', 'GitLab',
    'Docker', 'Kubernetes', 'Linux', 'Windows', 'MacOS', 'Android', 'iOS',
    'Python', 'Django', 'Flask', 'FastAPI', 'Node', 'Rust', 'Go', 'Java',
    'SuperMemory', 'Supermemory', 'FloBrainCore', 'ChromaDB', 'PostgreSQL',
    'Redis', 'MongoDB', 'Cloudflare', 'Vercel', 'HuggingFace', 'PyTorch',
    'TensorFlow', 'Spacy', 'LangChain', 'LlamaIndex',
}

# Single capitalized word pattern
_SINGLE_CAP_WORD = re.compile(r'\b[A-ZА-ЯЁ][a-zа-яё]{2,}\b')


def _classify_cap_sequence(text: str) -> str:
    """Classifies a capitalized sequence as person/organization/location/misc."""
    words = text.split()
    last_word = words[-1]

    if last_word in _ORG_SUFFIXES:
        return "organization"
    if last_word in _LOCATION_INDICATORS:
        return "location"
    if any(word in _NAME_STOPWORDS for word in words):
        return "misc"
    # Heuristic: 2 words → likely person, 3+ words → likely organization
    if len(words) <= 2:
        return "person"
    return "organization"


def _normalize(entity_type: str, text: str) -> str:
    """Returns canonical form for an entity."""
    if entity_type in ("email", "url", "hashtag", "mention"):
        return text.lower()
    if entity_type == "phone":
        return re.sub(r'[\s\-\.\(\)]', '', text)
    if entity_type in ("date_iso", "date_eu"):
        return text
    return text  # person/organization/location keep original casing


def extract_entities(text: str) -> List[Dict[str, Any]]:
    """
    Extracts entities from text using regex patterns and heuristics.

    Returns a list of entity dicts (see module docstring for schema).
    Overlapping entities are deduplicated: the longest match at each
    position wins.
    """
    if not text or not text.strip():
        return []

    raw_spans: List[Dict[str, Any]] = []

    # Pattern-based extraction (high precision)
    for entity_type, pattern in _PATTERNS:
        for match in pattern.finditer(text):
            raw_spans.append({
                "text": match.group(0),
                "type": entity_type if entity_type not in ("date_iso", "date_eu") else "date",
                "start": match.start(),
                "end": match.end(),
                "normalized": _normalize(entity_type, match.group(0)),
                "_precision": 1.0,  # high-confidence
            })

    # Heuristic capitalized-sequence extraction (lower precision)
    for match in _CAP_SEQUENCE.finditer(text):
        surface = match.group(0).strip()
        # Skip if all stopwords
        words = surface.split()
        if all(w in _NAME_STOPWORDS for w in words):
            continue
        # Skip if already covered by a higher-precision entity
        if any(s["start"] <= match.start() and s["end"] >= match.end() for s in raw_spans):
            continue

        entity_type = _classify_cap_sequence(surface)
        raw_spans.append({
            "text": surface,
            "type": entity_type,
            "start": match.start(),
            "end": match.end(),
            "normalized": _normalize(entity_type, surface),
            "_precision": 0.6,  # heuristic confidence
        })

    # Single capitalized words (Anna, Microsoft, Helsinki) — person/org/location
    for match in _SINGLE_CAP_WORD.finditer(text):
        surface = match.group(0)
        if surface in _NAME_STOPWORDS:
            continue
        # Skip if already covered by a multi-word span
        if any(s["start"] <= match.start() and s["end"] >= match.end() for s in raw_spans):
            continue
        # Classify: known org → organization, otherwise → person (default for names)
        if surface in _KNOWN_ORGS:
            entity_type = "organization"
        else:
            entity_type = "person"
        raw_spans.append({
            "text": surface,
            "type": entity_type,
            "start": match.start(),
            "end": match.end(),
            "normalized": _normalize(entity_type, surface),
            "_precision": 0.5,
        })

    # Sort by (start, -length) to deduplicate overlapping spans
    raw_spans.sort(key=lambda s: (s["start"], -(s["end"] - s["start"])))

    # Deduplicate: drop spans fully contained in a longer span at same start
    final: List[Dict[str, Any]] = []
    occupied: List[tuple] = []  # list of (start, end) ranges already taken
    for span in raw_spans:
        s, e = span["start"], span["end"]
        # Skip if this span overlaps significantly with an existing one
        if any(not (e <= os or s >= oe) and (min(e, oe) - max(s, os)) > 2 for os, oe in occupied):
            continue
        occupied.append((s, e))
        # Strip internal fields before returning
        clean = {k: v for k, v in span.items() if not k.startswith('_')}
        final.append(clean)

    logger.debug(f"[EntityExtractor] Extracted {len(final)} entities from {len(text)} chars")
    return final


def extract_entities_grouped(text: str) -> Dict[str, List[str]]:
    """
    Convenience wrapper: returns entities grouped by type.
    Example: {"person": ["Anna Smith"], "email": ["anna@x.com"]}
    """
    grouped: Dict[str, List[str]] = {}
    for ent in extract_entities(text):
        grouped.setdefault(ent["type"], [])
        if ent["normalized"] not in grouped[ent["type"]]:
            grouped[ent["type"]].append(ent["normalized"])
    return grouped


class EntityExtractor:
    """Reusable extractor instance."""

    def extract(self, text: str) -> List[Dict[str, Any]]:
        return extract_entities(text)

    def extract_grouped(self, text: str) -> Dict[str, List[str]]:
        return extract_entities_grouped(text)


# Default singleton instance
default_extractor = EntityExtractor()
