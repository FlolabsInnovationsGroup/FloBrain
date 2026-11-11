import logging
import math
import re
import chromadb
import numpy as np
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field
from django.conf import settings
from django.db.models import Q
from django.utils.module_loading import import_string

from .models import MemoryNode, MemoryLink

logger = logging.getLogger(__name__)

_collection = None


def get_embedding_function():
    """Server-side embedder for the memory collection (configurable for tests)."""
    return import_string(settings.MEMORY_EMBEDDING_FUNCTION)()


def get_collection():
    global _collection
    if _collection is None:
        chroma_client = chromadb.PersistentClient(
            path=settings.MEMORY_VECTOR_DB_PATH,
            settings=chromadb.config.Settings(anonymized_telemetry=False),
        )
        _collection = chroma_client.get_or_create_collection(
            name=settings.MEMORY_VECTOR_COLLECTION,
            embedding_function=get_embedding_function(),
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def reset_vector_store():
    global _collection
    _collection = None


def index_node(node: MemoryNode) -> bool:
    """Embed the node's canonical content and upsert it; record index_status. Never raises."""
    try:
        if not node.content:
            raise ValueError("node has no content to index")
        get_collection().upsert(
            ids=[node.id],
            documents=[node.content],
            metadatas=[{"o_id": node.owner_id, "memory_type": node.memory_type}],
        )
    except Exception as e:
        logger.error(f"E_0x01: Failed to index memory node {node.id}: {e}", exc_info=True)
        node.index_status, node.index_error = MemoryNode.INDEX_FAILED, str(e)[:1000]
        MemoryNode.objects.filter(pk=node.pk).update(
            index_status=node.index_status, index_error=node.index_error
        )
        return False

    node.index_status, node.index_error = MemoryNode.INDEX_INDEXED, ""
    MemoryNode.objects.filter(pk=node.pk).update(index_status=node.index_status, index_error="")
    return True


def delete_vectors(ids: Optional[List[str]] = None, owner_id: Optional[str] = None) -> bool:
    """Delete vectors by node IDs and/or by owner. Never raises."""
    try:
        if ids:
            get_collection().delete(ids=list(ids))
        if owner_id:
            get_collection().delete(where={"o_id": owner_id})
        return True
    except Exception as e:
        logger.error(f"E_0x03: Failed to delete memory vectors: {e}", exc_info=True)
        return False


def query_owner_vectors(owner_id: str, query_text: str, n_results: int = 10) -> List[Tuple[str, float]]:
    """Return (node_id, cosine distance) for the owner's nearest vectors."""
    collection = get_collection()
    count = collection.count()
    if not count or not query_text:
        return []
    results = collection.query(
        query_texts=[query_text],
        n_results=min(n_results, count),
        where={"o_id": owner_id},
    )
    if not results or not results["ids"] or not results["ids"][0]:
        return []
    return list(zip(results["ids"][0], results["distances"][0]))


class BaseVectorTransformer(ABC):
    @abstractmethod
    def transform(self, embedding: List[float]) -> List[float]:
        pass


class L2NormalizationTransformer(BaseVectorTransformer):
    def transform(self, embedding: List[float]) -> List[float]:
        tensor = np.array(embedding, dtype=np.float32)
        tensor = np.nan_to_num(tensor, nan=0.0, posinf=0.0, neginf=0.0)
        norm = np.linalg.norm(tensor)
        if norm > 0:
            tensor = tensor / norm
        return tensor.tolist()


class SearchCandidate(BaseModel):
    node_id: str
    score: float
    text: str = ""
    metadata: Dict[str, Any] = Field(default_factory=dict)


class GraphGraphRelationService:
    @staticmethod
    def get_adjacent_nodes(node_ids: List[str]) -> Dict[str, List[Tuple[str, float]]]:
        links = MemoryLink.objects.filter(
            Q(source_id__in=node_ids) | Q(target_id__in=node_ids)
        ).values('source_id', 'target_id', 'weight')

        adjacency_map = {nid: [] for nid in node_ids}
        for link in links:
            src = link['source_id']
            tgt = link['target_id']
            w = link['weight']

            if src in adjacency_map:
                adjacency_map[src].append((tgt, w))
            if tgt in adjacency_map:
                adjacency_map[tgt].append((src, w))

        return adjacency_map


def _tokenize(text: str) -> List[str]:
    return re.findall(r'\w+', text.lower())


# Function words ignored by the lexical scorer so they cannot carry relevance.
_STOPWORDS = frozenset(
    "a an and are as at be but by do does did for from had has have how i if in into is it its "
    "me my of on or our so that the their them then there these they this to us was we were what "
    "when where which who why will with you your about".split()
)


def _query_terms(query_text: str) -> List[str]:
    return list(dict.fromkeys(t for t in _tokenize(query_text) if t not in _STOPWORDS))


def _eligible_rows(owner_id: str, exclude_ids: Optional[List[str]] = None):
    """I2: the caller's own rows that are neither excluded nor superseded."""
    rows = MemoryNode.objects.filter(owner_id=owner_id, is_excluded=False, superseded_by__isnull=True)
    if exclude_ids:
        rows = rows.exclude(id__in=list(exclude_ids))
    return rows


def _lexical_scores(owner_id: str, query_text: str, exclude_ids: Optional[List[str]] = None) -> Dict[str, float]:
    """IDF-weighted share of the query's terms present in each eligible row's content (0..1).

    rank_bm25's BM25Okapi scores one- and two-document corpora (common for a single user)
    at zero or below, which makes a relevance floor meaningless, so coverage is used instead.
    The corpus is bounded to the most recent MEMORY_LEXICAL_CORPUS_LIMIT rows (known scale limit).
    """
    terms = _query_terms(query_text)
    if not terms:
        return {}
    rows = _eligible_rows(owner_id, exclude_ids).order_by('-updated_at').values_list('id', 'content')
    docs = {nid: set(_tokenize(content or "")) for nid, content in rows[:settings.MEMORY_LEXICAL_CORPUS_LIMIT]}
    if not docs:
        return {}
    n = len(docs)
    idf = {t: math.log(1 + (n + 1) / (sum(t in tokens for tokens in docs.values()) + 0.5)) for t in terms}
    total = sum(idf.values())
    scores = {}
    for nid, tokens in docs.items():
        matched = sum(idf[t] for t in terms if t in tokens)
        if matched:
            scores[nid] = matched / total
    return scores


def retrieve_memories(
    owner_id: str,
    query_text: str,
    limit: Optional[int] = None,
    exclude_ids: Optional[List[str]] = None,
) -> List[Tuple[str, str, float]]:
    """Owner-scoped hybrid recall: [(node_id, content, score)], best first.

    Vector and lexical scoring are failure-isolated; either alone still answers.
    Scores are absolute (cosine similarity, term coverage), fused 0.6/0.4 when both
    are available, and floored at MEMORY_MIN_RELEVANCE. Every candidate is re-joined
    to SQL (I2) so stale or foreign vectors can only cause a miss.
    """
    limit = limit or settings.MEMORY_RETRIEVAL_LIMIT
    if not query_text or not query_text.strip():
        return []

    vector_scores: Optional[Dict[str, float]] = None
    try:
        vector_scores = {
            nid: max(0.0, 1.0 - distance)
            for nid, distance in query_owner_vectors(owner_id, query_text, n_results=limit * 3)
        }
    except Exception as e:
        logger.warning(f"E_0x02: Vector recall unavailable, using lexical only: {e}")

    lexical_scores: Optional[Dict[str, float]] = None
    try:
        lexical_scores = _lexical_scores(owner_id, query_text, exclude_ids)
    except Exception as e:
        logger.warning(f"E_0x02: Lexical recall unavailable, using vectors only: {e}")

    if vector_scores is None and lexical_scores is None:
        return []

    candidate_ids = set(vector_scores or {}) | set(lexical_scores or {})
    fused: Dict[str, float] = {}
    for nid in candidate_ids:
        if vector_scores is not None and lexical_scores is not None:
            score = 0.6 * vector_scores.get(nid, 0.0) + 0.4 * lexical_scores.get(nid, 0.0)
        elif vector_scores is not None:
            score = vector_scores.get(nid, 0.0)
        else:
            score = lexical_scores.get(nid, 0.0)
        if score >= settings.MEMORY_MIN_RELEVANCE:
            fused[nid] = score
    if not fused:
        return []

    contents = dict(_eligible_rows(owner_id, exclude_ids).filter(id__in=list(fused)).values_list('id', 'content'))
    results = [(nid, contents[nid], score) for nid, score in fused.items() if nid in contents]
    results.sort(key=lambda r: r[2], reverse=True)
    return results[:limit]


class AsyncAssociativeMemoryManager:
    def __init__(self, transformer: Optional[BaseVectorTransformer] = None):
        self.transformer = transformer or L2NormalizationTransformer()

    def process_background_rerank(self, query_text: str, owner_id: str) -> List[str]:
        return [nid for nid, _content, _score in retrieve_memories(owner_id, query_text, limit=20)]
