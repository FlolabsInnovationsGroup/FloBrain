import logging
import re
import chromadb
import numpy as np
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from pydantic import BaseModel, Field
from rank_bm25 import BM25Okapi
from django.db.models import Q

from .models import MemoryNode, MemoryLink

logger = logging.getLogger(__name__)

chroma_client = chromadb.PersistentClient(path="/app/vector_db")
collection = chroma_client.get_or_create_collection(name="flobrain_associative_memory")


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


def _apply_manifold_projection(embedding: List[float]) -> List[float]:
    tensor = np.array(embedding, dtype=np.float32)
    tensor = np.nan_to_num(tensor, nan=0.0, posinf=0.0, neginf=0.0)
    norm = np.linalg.norm(tensor)
    if norm > 0:
        tensor = tensor / norm
    tensor = tensor * (np.tanh(tensor) + 0.05)
    return np.clip(tensor, -1.0, 1.0).astype(np.float16).tolist()


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


def hybrid_search(
    query_text: str,
    query_embedding: List[float],
    owner_id: str,
    top_n: int = 10,
    active_context_ids: Optional[List[str]] = None
) -> List[str]:
    try:
        projected_embedding = _apply_manifold_projection(query_embedding)
        chroma_results = collection.query(
            query_embeddings=[projected_embedding],
            n_results=max(top_n * 3, 30),
            where={"o_id": owner_id}
        )

        vector_candidates: Dict[str, float] = {}
        if chroma_results and chroma_results['ids'] and chroma_results['ids'][0]:
            ids = chroma_results['ids'][0]
            distances = chroma_results['distances'][0]
            for nid, dist in zip(ids, distances):
                vector_candidates[nid] = 1.0 / (1.0 + dist)

        db_nodes = MemoryNode.objects.filter(
            owner_id=owner_id,
            tier_level__in=[1, 2]
        ).only('id', 'name')

        node_map = {node.id: node for node in db_nodes}

        candidate_ids = list(set(list(vector_candidates.keys()) + list(node_map.keys())))
        if not candidate_ids:
            return []

        corpus_ids = []
        corpus_tokens = []
        for cid in candidate_ids:
            if cid in node_map:
                node_text = node_map[cid].name
                corpus_ids.append(cid)
                corpus_tokens.append(_tokenize(node_text))

        bm25_scores: Dict[str, float] = {}
        if corpus_tokens:
            bm25_model = BM25Okapi(corpus_tokens)
            query_tokens = _tokenize(query_text)
            doc_scores = bm25_model.get_scores(query_tokens)
            for cid, score in zip(corpus_ids, doc_scores):
                bm25_scores[cid] = float(score)

        max_v = max(vector_candidates.values()) if vector_candidates else 1.0
        max_b = max(bm25_scores.values()) if bm25_scores else 1.0

        stage1_ranked: List[Tuple[str, float]] = []
        for cid in candidate_ids:
            v_score = vector_candidates.get(cid, 0.0) / (max_v if max_v > 0 else 1.0)
            b_score = bm25_scores.get(cid, 0.0) / (max_b if max_b > 0 else 1.0)
            combined_score = (0.6 * v_score) + (0.4 * b_score)
            stage1_ranked.append((cid, combined_score))

        stage1_ranked.sort(key=lambda x: x[1], reverse=True)
        intermediate_candidates = stage1_ranked[:max(top_n * 2, 15)]
        intermediate_ids = [c[0] for c in intermediate_candidates]

        adjacency_data = GraphGraphRelationService.get_adjacent_nodes(intermediate_ids)

        final_scored_candidates = []
        context_anchors = active_context_ids if active_context_ids else intermediate_ids[:3]

        for cid, s1_score in intermediate_candidates:
            hebbian_boost = 0.0
            connected_relations = adjacency_data.get(cid, [])

            for target_id, weight in connected_relations:
                if target_id in context_anchors:
                    hebbian_boost += weight

            final_score = s1_score + (0.3 * hebbian_boost)
            final_scored_candidates.append((cid, final_score))

        final_scored_candidates.sort(key=lambda x: x[1], reverse=True)
        return [candidate[0] for candidate in final_scored_candidates[:top_n]]

    except Exception as e:
        logger.error(f"E_0x02: Critical error in two-stage hybrid search pipeline: {e}", exc_info=True)
        try:
            return chroma_results['ids'][0][:top_n] if 'chroma_results' in locals() else []
        except Exception:
            return []


def save_to_associative_layer(node: MemoryNode, embedding: List[float]) -> bool:
    try:
        projected_tensor = _apply_manifold_projection(embedding)
        collection.add(
            ids=[node.id],
            embeddings=[projected_tensor],
            metadatas=[{
                "o_id": getattr(node, 'owner_id', 'system'),
                "q_flag": True,
                "t_sync": datetime.now().isoformat()
            }]
        )
        return True
    except Exception as e:
        logger.error(f"E_0x01: Error saving to associative vector layer: {e}")
        return False


class AsyncAssociativeMemoryManager:
    def __init__(self, transformer: Optional[BaseVectorTransformer] = None):
        self.transformer = transformer or L2NormalizationTransformer()

    def process_background_rerank(self, query_text: str, owner_id: str) -> List[str]:
        return hybrid_search(query_text, [0.0] * 1536, owner_id, top_n=20)
