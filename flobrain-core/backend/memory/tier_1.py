import logging
import hashlib
import struct
import threading
from abc import ABC, abstractmethod
from collections import Counter, defaultdict, OrderedDict
from typing import Dict, Any, List, Optional, Tuple
from django.core.cache import cache

logger = logging.getLogger(__name__)


class IANSCodec(ABC):
    @abstractmethod
    def encode(self, token_indices: List[int]) -> Tuple[int, bytes, Dict[int, int]]:
        pass

    @abstractmethod
    def decode(self, state: int, bitstream: bytes, freqs: Dict[int, int], n_symbols: int) -> List[int]:
        pass


class PythonRANSCodec(IANSCodec):
    def __init__(self, M: int = 2048):
        self.M = M
        self.RENORM_FACTOR = 1 << 24

    def _to_zigzag(self, n: int) -> int:
        return (n << 1) ^ (n >> 31)

    def _from_zigzag(self, n: int) -> int:
        return (n >> 1) ^ -(n & 1)

    def encode(self, token_indices: List[int]) -> Tuple[int, bytes, Dict[int, int]]:
        if not token_indices:
            return 0, b"", {}

        processed_tokens = [self._to_zigzag(t) for t in token_indices]
        counts = Counter(processed_tokens)
        total = len(processed_tokens)

        freqs = {}
        remaining = self.M
        for sym, count in counts.items():
            f = max(1, int(count * self.M / total))
            freqs[sym] = f
            remaining -= f

        if remaining != 0:
            most_common = counts.most_common(1)[0][0]
            freqs[most_common] = max(1, freqs[most_common] + remaining)

        cum_freqs = {}
        cum = 0
        for sym, f in sorted(freqs.items()):
            cum_freqs[sym] = cum
            cum += f

        state = self.M
        bitstream = bytearray()

        for sym in reversed(processed_tokens):
            f = freqs[sym]
            start = cum_freqs[sym]
            threshold = f * self.RENORM_FACTOR
            while state >= threshold:
                bitstream.append(state & 0xFF)
                state >>= 8
            state = (state // f) * self.M + (state % f) + start

        return state, bytes(bitstream), freqs

    def decode(self, state: int, bitstream: bytes, freqs: Dict[int, int], n_symbols: int) -> List[int]:
        if n_symbols <= 0 or not freqs:
            return []

        cum_freqs = {}
        cum = 0
        for sym, f in sorted(freqs.items()):
            cum_freqs[sym] = cum
            cum += f

        cdf_map = []
        for sym, f in sorted(freqs.items()):
            start = cum_freqs[sym]
            for _ in range(f):
                cdf_map.append((sym, start, f))

        decoded_zigzag = []
        bit_ptr = 0
        bitstream_len = len(bitstream)

        for _ in range(n_symbols):
            slot = state % self.M
            sym, start, f = cdf_map[slot]
            decoded_zigzag.append(sym)
            state = f * (state // self.M) + slot - start
            while state < self.M and bit_ptr < bitstream_len:
                state = (state << 8) | bitstream[bit_ptr]
                bit_ptr += 1

        return [self._from_zigzag(t) for t in reversed(decoded_zigzag)]


class NativeANSCodecAdapter:
    def __init__(self, codec: Optional[IANSCodec] = None):
        self.codec = codec or PythonRANSCodec()

    def encode(self, token_indices: List[int]) -> Tuple[int, bytes, Dict[int, int]]:
        if not token_indices:
            return 0, b"", {}

        if not isinstance(token_indices, list) or not all(isinstance(i, int) for i in token_indices):
            logger.error("[ANS Adapter] Critical error: invalid input data structure passed to encoder.")
            return 0, b"", {}

        try:
            return self.codec.encode(token_indices)
        except (ValueError, TypeError, struct.error) as e:
            logger.error(f"[ANS Adapter] Allocation/compression error during token sequence processing: {e}", exc_info=True)
            return 0, b"", {}
        except Exception as e:
            logger.critical(f"[ANS Adapter] Unexpected system failure in encoder: {e}", exc_info=True)
            return 0, b"", {}

    def decode(self, state: int, bitstream: bytes, freqs: Dict[int, int], n_symbols: int) -> List[int]:
        if not bitstream or not freqs or n_symbols <= 0:
            logger.warning("[ANS Adapter] Empty or invalid payload passed for decoding.")
            return []

        try:
            return self.codec.decode(state, bitstream, freqs, n_symbols)
        except (ValueError, KeyError, struct.error) as e:
            logger.error(f"[ANS Adapter] Critical decoding error: blob corrupted or frequency structure mismatch: {e}", exc_info=True)
            return []
        except Exception as e:
            logger.critical(f"[ANS Adapter] System failure during rANS buffer decompression: {e}", exc_info=True)
            return []


class ActiveMemoryEvictionController:
    def __init__(self, capacity: int = 5000):
        self.capacity = capacity
        self._lock = threading.Lock()
        self.tracked_keys = OrderedDict()

    def register_key(self, key: str) -> Optional[str]:
        with self._lock:
            self.tracked_keys[key] = True
            self.tracked_keys.move_to_end(key)
            if len(self.tracked_keys) > self.capacity:
                evicted_key, _ = self.tracked_keys.popitem(last=False)
                return evicted_key
            return None

    def touch_key(self, key: str):
        with self._lock:
            if key in self.tracked_keys:
                self.tracked_keys.move_to_end(key)

    def remove_key(self, key: str):
        with self._lock:
            self.tracked_keys.pop(key, None)

    def keys(self) -> List[str]:
        with self._lock:
            return list(self.tracked_keys.keys())

    def __len__(self) -> int:
        with self._lock:
            return len(self.tracked_keys)

    def __contains__(self, key: str) -> bool:
        with self._lock:
            return key in self.tracked_keys


class MemoryGraphRegistry:
    def __init__(self):
        self._lock = threading.Lock()
        self.ref_counts = defaultdict(int)
        self.node_to_hash = {}
        self.hash_to_nodes = defaultdict(set)

    def register_link(self, node_id: str, owner_id: str, content_hash: str):
        with self._lock:
            self.node_to_hash[node_id] = content_hash
            self.hash_to_nodes[content_hash].add(node_id)
            self.ref_counts[content_hash] += 1
            logger.debug(f"[Graph Registry] Node {node_id} registered. References to hash {content_hash[:8]}: {self.ref_counts[content_hash]}")

    def release_link(self, node_id: str, owner_id: str, content_hash: str) -> bool:
        with self._lock:
            current_hash = self.node_to_hash.get(node_id, content_hash)

            if current_hash in self.ref_counts:
                self.ref_counts[current_hash] -= 1

                if current_hash in self.hash_to_nodes:
                    self.hash_to_nodes[current_hash].discard(node_id)

                if self.ref_counts[current_hash] <= 0:
                    self.ref_counts.pop(current_hash, None)
                    self.hash_to_nodes.pop(current_hash, None)
                    self.node_to_hash.pop(node_id, None)
                    return True

            self.node_to_hash.pop(node_id, None)
            return False


class Tier1ActiveMemoryManager:
    NODE_PREFIX = "tier1:node:"

    def __init__(self, codec: NativeANSCodecAdapter, eviction_controller: ActiveMemoryEvictionController, graph_registry: MemoryGraphRegistry):
        self.codec = codec
        self.eviction_controller = eviction_controller
        self.graph_registry = graph_registry

    def save_node(self, node_id: str, owner_id: str, token_indices: List[int], content_hash: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        cache_key = f"{self.NODE_PREFIX}{node_id}"

        self.graph_registry.register_link(node_id, owner_id, content_hash)

        state, bitstream, freqs = self.codec.encode(token_indices)

        payload = {
            "node_id": node_id,
            "owner_id": owner_id,
            "ans_state": state,
            "bitstream": bitstream.hex(),
            "freqs": {str(k): v for k, v in freqs.items()},
            "n_symbols": len(token_indices),
            "metadata": metadata or {}
        }

        cache.set(cache_key, payload, timeout=None)

        evicted_key = self.eviction_controller.register_key(cache_key)
        if evicted_key:
            evicted_node_id = evicted_key.replace(self.NODE_PREFIX, "")
            logger.info(f"[Tier 1 Eviction] Buffer capacity exceeded. Evicting node {evicted_node_id}")
            self.delete_node(evicted_node_id, owner_id, content_hash)

        return True

    def load_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        cache_key = f"{self.NODE_PREFIX}{node_id}"
        payload = cache.get(cache_key)

        if not payload:
            return None

        self.eviction_controller.touch_key(cache_key)

        state = payload["ans_state"]
        bitstream = bytes.fromhex(payload["bitstream"])
        freqs = {int(k): v for k, v in payload["freqs"].items()}
        n_symbols = payload["n_symbols"]

        tokens = self.codec.decode(state, bitstream, freqs, n_symbols)

        return {
            "node_id": payload["node_id"],
            "owner_id": payload["owner_id"],
            "tokens": tokens,
            "metadata": payload["metadata"]
        }

    def get_node_data(self, node_id: str) -> Optional[Dict[str, Any]]:
        return self.load_node(node_id)

    def delete_node(self, node_id: str, owner_id: str, content_hash: str) -> bool:
        cache_key = f"{self.NODE_PREFIX}{node_id}"
        can_delete = self.graph_registry.release_link(node_id, owner_id, content_hash)

        if can_delete:
            cache.delete(cache_key)
            self.eviction_controller.remove_key(cache_key)
            logger.info(f"[Tier 1 Graph] Node {node_id} fully removed from memory.")
            return True

        logger.info(f"[Tier 1 Graph] Reference to {node_id} decremented; physical node retained because duplicates still reference it.")
        return False


_codec = NativeANSCodecAdapter()
_eviction = ActiveMemoryEvictionController(capacity=5000)
_graph = MemoryGraphRegistry()

active_memory_service = Tier1ActiveMemoryManager(
    codec=_codec,
    eviction_controller=_eviction,
    graph_registry=_graph
)


def save_to_active_buffer(node) -> bool:
    try:
        tokens = node.metadata.get("tokens", [])
        content_hash = getattr(node, "content_hash", hashlib.sha256(str(tokens).encode()).hexdigest())

        return active_memory_service.save_node(
            node_id=node.id,
            owner_id=node.owner_id,
            token_indices=tokens,
            content_hash=content_hash,
            metadata=node.metadata
        )
    except Exception as e:
        logger.error(f"[Tier 1 Adapter] Error while saving to buffer: {e}", exc_info=True)
        return False


def load_from_active_buffer(node_id: str) -> Optional[Dict[str, Any]]:
    return active_memory_service.load_node(node_id)
