import logging
import uuid
import hashlib
import os
import pickle
import numpy as np
import copy
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Set
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from .models import MemoryNode, MemoryLink

logger = logging.getLogger(__name__)

TITLE_MAX_CHARS = 80


def normalize_content(content: str) -> str:
    """Case- and whitespace-insensitive form used for content dedup."""
    return " ".join((content or "").split()).lower()


def content_hash_for(content: str) -> str:
    return hashlib.sha256(normalize_content(content).encode('utf-8')).hexdigest()


def _default_title(content: str) -> str:
    title = " ".join(content.split())
    return title if len(title) <= TITLE_MAX_CHARS else title[:TITLE_MAX_CHARS - 1] + "…"


class BaseTierRouter(ABC):
    
    @abstractmethod
    def determine_tier(self, data_payload: Dict[str, Any]) -> int:
        pass


class HeuristicTierRouter(BaseTierRouter):
    
    def determine_tier(self, data_payload: Dict[str, Any]) -> int:
        score = float(data_payload.get('importance', 0.5))
        is_global = data_payload.get('is_global', False)
        
        if is_global:
            return 1 if score >= 0.6 else 2
            
        if score >= 0.75:
            return 1
        elif score >= 0.35:
            return 2
        return 3


class MLTierRouter(BaseTierRouter):
    
    def __init__(self, model_path: str = "/app/models/tier_router.pkl"):
        self.model_path = model_path
        self.fallback_router = HeuristicTierRouter()
        self.model = None
        self._load_model_weights()

    def _load_model_weights(self) -> None:
        if not os.path.exists(self.model_path):
            logger.warning(
                f"[MLRouter] Model weights file missing at: '{self.model_path}'. "
                f"Emergency fallback to HeuristicTierRouter activated."
            )
            return

        try:
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            logger.info(f"[MLRouter] ML model weights loaded from '{self.model_path}'.")
        except Exception as e:
            logger.warning(
                f"[MLRouter] Weights file '{self.model_path}' corrupted or unreadable ({e}). "
                f"Automatic switch to HeuristicTierRouter to prevent API failure."
            )
            self.model = None

    def determine_tier(self, data_payload: Dict[str, Any]) -> int:
        if self.model is None:
            return self.fallback_router.determine_tier(data_payload)
            
        try:
            importance = float(data_payload.get('importance', 0.5))
            is_global = int(data_payload.get('is_global', False))
            
            if hasattr(self.model, 'predict'):
                features = np.array([[importance, is_global]])
                prediction = self.model.predict(features)
                
                if isinstance(prediction, (list, np.ndarray)):
                    return int(prediction[0])
                return int(prediction)
                
            raise AttributeError("Loaded model object lacks a standard 'predict' method.")
            
        except Exception as e:
            logger.error(
                f"[MLRouter] Inference failure: {e}. "
                f"Emergency switch to HeuristicTierRouter as fallback.", 
                exc_info=True
            )
            return self.fallback_router.determine_tier(data_payload)


class MemoryDistributionService:
    def __init__(self, router: BaseTierRouter, num_hashes: int = 64, k_gram: int = 4):
        self.router = router
        self.num_hashes = num_hashes
        self.k_gram = k_gram

    def _get_shingles(self, text: str) -> Set[str]:
        if not text:
            return set()
        if len(text) <= self.k_gram:
            return {text}
        return {text[i:i + self.k_gram] for i in range(len(text) - self.k_gram + 1)}

    def _compute_minhash_signature(self, text: str) -> List[int]:
        shingles = self._get_shingles(text)
        if not shingles:
            return [0] * self.num_hashes

        signature = []
        for i in range(self.num_hashes):
            min_hash = float('inf')
            salt = f"flo_salt_v1_{i}_"
            
            for shingle in shingles:
                combined_token = salt + shingle
                hashed_val = int(hashlib.md5(combined_token.encode('utf-8')).hexdigest(), 16)
                
                if hashed_val < min_hash:
                    min_hash = hashed_val
            signature.append(min_hash)
            
        return signature

    def _calculate_jaccard_similarity(self, sig1: List[int], sig2: List[int]) -> float:
        if not sig1 or not sig2 or len(sig1) != len(sig2):
            return 0.0
        matches = sum(1 for a, b in zip(sig1, sig2) if a == b)
        return matches / self.num_hashes

    def _get_next_binary_index(self) -> int:
        last_node = MemoryNode.objects.exclude(binary_index__isnull=True).order_by('-binary_index').first()
        next_index = (last_node.binary_index + 1) if last_node and last_node.binary_index else 1
        if next_index > 65535:
            next_index = 1
        return next_index

    def distribute_to_tiers(self, data_payload: Dict[str, Any]) -> MemoryNode:
        """Create (or reuse) the owner's node for this content.

        IDs are always server-generated. Dedup is exact on normalized content per
        owner, so different facts under the same title stay distinct. A reused
        node is returned with `deduplicated = True`.
        """
        node_id = uuid.uuid4().hex
        owner_id = data_payload['owner_id']
        content = data_payload['content']
        raw_name = data_payload.get('name') or _default_title(content)

        incoming_signature = self._compute_minhash_signature(normalize_content(content))
        incoming_hash = content_hash_for(content)

        duplicate_node = MemoryNode.objects.filter(
            owner_id=owner_id,
            content_hash=incoming_hash,
            superseded_by__isnull=True,
        ).order_by('-updated_at').first()

        if duplicate_node:
            logger.info(f"[Sorter] Duplicate content. Reusing node {duplicate_node.id}")

            try:
                with transaction.atomic():
                    MemoryNode.objects.filter(id=duplicate_node.id).update(
                        relevance=F('relevance') + 0.05,
                        updated_at=timezone.now()
                    )

                    session_id = data_payload.get('current_session_id') or data_payload.get('session_id')
                    if session_id and MemoryNode.objects.filter(id=session_id, owner_id=owner_id).exists():
                        link, created = MemoryLink.objects.get_or_create(
                            source_id=session_id,
                            target_id=duplicate_node.id,
                            defaults={'relation': 'session_reinforce', 'weight': 0.2}
                        )
                        if not created:
                            link.weight = min(link.weight + 0.1, 1.0)
                            link.save()
                    
                    duplicate_node.refresh_from_db()
                    duplicate_node.deduplicated = True
                    return duplicate_node
                    
            except Exception as e:
                logger.error(f"[Sorter] Error during upsert for duplicate {duplicate_node.id}: {e}", exc_info=True)
                raise

        target_tier = self.router.determine_tier(data_payload)

        try:
            with transaction.atomic():
                next_index = self._get_next_binary_index()

                metadata = copy.deepcopy(data_payload.get('metadata', {}))
                metadata['minhash_signature'] = incoming_signature

                new_node = MemoryNode.objects.create(
                    id=node_id,
                    owner_id=owner_id,
                    name=raw_name,
                    content=content,
                    memory_type=data_payload.get('memory_type', 'chunk'),
                    source_chat_id=data_payload.get('source_chat_id'),
                    source_message_id=data_payload.get('source_message_id'),
                    binary_index=next_index,
                    tier_level=target_tier,
                    relevance=float(data_payload.get('importance', 0.5)),
                    content_hash=incoming_hash,
                    metadata=metadata
                )

                logger.info(f"[Sorter] New unique node {new_node.id} routed to Tier {target_tier}")
                new_node.deduplicated = False
                return new_node
                
        except Exception as e:
            logger.error(f"[Sorter] Critical error during atomic node creation {node_id}: {e}", exc_info=True)
            raise


default_router = HeuristicTierRouter()
sorter_service = MemoryDistributionService(router=default_router, num_hashes=64, k_gram=4)

def distribute_to_tiers(data_payload: Dict[str, Any]) -> MemoryNode:
    return sorter_service.distribute_to_tiers(data_payload)