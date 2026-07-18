"""
semantic_chunker.py — Local semantic text chunker.

Splits incoming text into meaningful semantic units (chunks) before storage.
Each chunk is a 1-3 sentence unit with optional overlap, preserving context.

This module is dependency-free and runs locally. It is designed to be
drop-in replaceable by SuperMemory's chunker when the semantic layer is
connected. The output schema (chunk dict) matches SuperMemory's document
chunk format so adapters can consume either source transparently.

Output chunk schema:
    {
        "id": str,                # deterministic hash of content
        "content": str,           # raw chunk text
        "position": int,          # 0-based chunk index in parent doc
        "parent_doc_id": str,     # hash of full document
        "start_char": int,        # offset in original text
        "end_char": int,          # offset in original text
        "metadata": dict          # arbitrary passthrough metadata
    }
"""
import re
import hashlib
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Sentence boundary pattern: matches . ! ? followed by whitespace + capital/quote
_SENTENCE_BOUNDARY = re.compile(r'(?<=[.!?])\s+(?=[A-ZА-ЯЁ0-9"\'\(\[])')
# Paragraph boundary: 2+ newlines
_PARAGRAPH_BOUNDARY = re.compile(r'\n\s*\n')
# Minimum chunk length to avoid empty / tiny chunks
_MIN_CHUNK_CHARS = 50
# Maximum chunk length to avoid huge chunks
_MAX_CHUNK_CHARS = 1000
# Overlap between consecutive chunks (in sentences)
_DEFAULT_OVERLAP_SENTENCES = 1


def _stable_id(text: str) -> str:
    """Deterministic SHA-256-based ID for a piece of text."""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()[:32]


def _split_sentences(text: str) -> List[str]:
    """Splits text into sentences, preserving trailing whitespace info."""
    if not text or not text.strip():
        return []
    # Normalize whitespace inside
    text = text.strip()
    # First split by paragraphs to preserve structure
    paragraphs = _PARAGRAPH_BOUNDARY.split(text)
    sentences: List[str] = []
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        parts = _SENTENCE_BOUNDARY.split(para)
        for part in parts:
            part = part.strip()
            if part:
                sentences.append(part)
    return sentences


def _group_sentences_into_chunks(
    sentences: List[str],
    max_chars: int = _MAX_CHUNK_CHARS,
    overlap: int = _DEFAULT_OVERLAP_SENTENCES
) -> List[str]:
    """Groups sentences into chunks respecting max_chars with sliding overlap."""
    if not sentences:
        return []

    chunks: List[str] = []
    i = 0
    while i < len(sentences):
        # Greedy fill: keep adding sentences until we hit max_chars
        current = []
        current_len = 0
        j = i
        while j < len(sentences):
            sent = sentences[j]
            addition = len(sent) + 1  # +1 for joining space
            if current and current_len + addition > max_chars:
                break
            current.append(sent)
            current_len += addition
            j += 1

        if not current:
            # Single sentence exceeds max_chars — emit it as-is
            current.append(sentences[i])
            j = i + 1

        chunks.append(' '.join(current))

        # Slide forward with overlap
        if j >= len(sentences):
            break
        if overlap > 0 and current:
            # Move forward by (len(current) - overlap) sentences
            step = max(1, len(current) - overlap)
            i += step
        else:
            i = j

    return chunks


def chunk_text(
    text: str,
    metadata: Optional[Dict[str, Any]] = None,
    max_chars: int = _MAX_CHUNK_CHARS,
    overlap: int = _DEFAULT_OVERLAP_SENTENCES,
    parent_doc_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Splits text into semantic chunks with positional metadata.

    Args:
        text: Input text to chunk.
        metadata: Arbitrary metadata to attach to each chunk (e.g. owner_id, source).
        max_chars: Soft maximum characters per chunk.
        overlap: Number of sentences to overlap between consecutive chunks.
        parent_doc_id: Optional parent document ID. If None, derived from full text.

    Returns:
        List of chunk dicts (see module docstring for schema).
    """
    if not text or not text.strip():
        return []

    text = text.strip()
    parent_id = parent_doc_id or _stable_id(text)
    base_metadata = dict(metadata or {})

    # Short text → single chunk
    if len(text) <= _MIN_CHUNK_CHARS:
        return [{
            "id": _stable_id(text),
            "content": text,
            "position": 0,
            "parent_doc_id": parent_id,
            "start_char": 0,
            "end_char": len(text),
            "metadata": base_metadata,
        }]

    sentences = _split_sentences(text)
    if not sentences:
        return [{
            "id": _stable_id(text),
            "content": text,
            "position": 0,
            "parent_doc_id": parent_id,
            "start_char": 0,
            "end_char": len(text),
            "metadata": base_metadata,
        }]

    chunk_texts = _group_sentences_into_chunks(sentences, max_chars=max_chars, overlap=overlap)

    # Calculate char offsets by scanning original text
    chunks: List[Dict[str, Any]] = []
    search_from = 0
    for idx, ct in enumerate(chunk_texts):
        # Find chunk text in original to compute offsets
        start = text.find(ct[:80], search_from)  # use prefix to be tolerant
        if start == -1:
            start = search_from
        end = start + len(ct)
        search_from = end

        chunks.append({
            "id": _stable_id(ct),
            "content": ct,
            "position": idx,
            "parent_doc_id": parent_id,
            "start_char": start,
            "end_char": end,
            "metadata": dict(base_metadata, chunk_position=idx),
        })

    logger.debug(f"[Chunker] Split text ({len(text)} chars) into {len(chunks)} chunks")
    return chunks


class SemanticChunker:
    """Reusable chunker instance with default settings."""

    def __init__(self, max_chars: int = _MAX_CHUNK_CHARS, overlap: int = _DEFAULT_OVERLAP_SENTENCES):
        self.max_chars = max_chars
        self.overlap = overlap

    def chunk(self, text: str, metadata: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        return chunk_text(text, metadata=metadata, max_chars=self.max_chars, overlap=self.overlap)


# Default singleton instance
default_chunker = SemanticChunker()
