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
        node_id = data_payload.get('id', uuid.uuid4().hex)
        owner_id = data_payload.get('owner_id', 'system')
        raw_name = data_payload.get('name', 'untitled')

        incoming_signature = self._compute_minhash_signature(raw_name)
        incoming_hash = hashlib.sha256(raw_name.encode('utf-8')).hexdigest()

        duplicate_node = MemoryNode.objects.filter(
            owner_id=owner_id,
            content_hash=incoming_hash
        ).order_by('-updated_at').first()

        if not duplicate_node:
            past_nodes = MemoryNode.objects.filter(owner_id=owner_id).order_by('-created_at')[:50]

            for old_node in past_nodes:
                old_signature = old_node.metadata.get('minhash_signature')
                if not old_signature:
                    old_signature = self._compute_minhash_signature(old_node.name)

                similarity = self._calculate_jaccard_similarity(incoming_signature, old_signature)
                
                if similarity >= 0.90:
                    duplicate_node = old_node
                    break

        if duplicate_node:
            logger.info(f"[MinHash Deduplication] Duplicate thought. Merging {node_id} -> {duplicate_node.id}")
            
            try:
                with transaction.atomic():
                    MemoryNode.objects.filter(id=duplicate_node.id).update(
                        relevance=F('relevance') + 0.05,
                        updated_at=timezone.now()
                    )
                    
                    session_id = data_payload.get('current_session_id') or data_payload.get('session_id')
                    if session_id and MemoryNode.objects.filter(id=session_id).exists():
                        link, created = MemoryLink.objects.get_or_create(
                            source_id=session_id,
                            target_id=duplicate_node.id,
                            defaults={'relation': 'session_reinforce', 'weight': 0.2}
                        )
                        if not created:
                            link.weight = min(link.weight + 0.1, 1.0)
                            link.save()
                    
                    duplicate_node.refresh_from_db()
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
                    binary_index=next_index,
                    tier_level=target_tier,
                    relevance=float(data_payload.get('importance', 0.5)),
                    content_hash=incoming_hash,
                    metadata=metadata
                )
                
                logger.info(f"[Sorter] New unique node {new_node.id} routed to Tier {target_tier}")
                return new_node
                
        except Exception as e:
            logger.error(f"[Sorter] Critical error during atomic node creation {node_id}: {e}", exc_info=True)
            raise


default_router = HeuristicTierRouter()
sorter_service = MemoryDistributionService(router=default_router, num_hashes=64, k_gram=4)

def distribute_to_tiers(data_payload: Dict[str, Any]) -> MemoryNode:
    return sorter_service.distribute_to_tiers(data_payload)