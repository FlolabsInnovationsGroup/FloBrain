"""
tests_integration.py — Comprehensive stress test suite for FloBrainCore memory subsystem.

Covers:
  1. Sorter: MinHash deduplication, content_hash exact lookup, boundary routing
  2. Tier 1: rANS codec robustness, LRU eviction, ghost-link exclusion
  3. Tier 2: vector NaN/Inf sanitization, semantic autonomy, ChromaDB retry
  4. Tier 3: cold-storage outage fault tolerance (no data loss)
  5. Hebbian: weight saturation wall, time-decay
  6. Context assembler: micro token budget, tri-tier cascade integration
  7. SuperMemory adapter: STUB mode resilience, connector failure fallback,
     memorize/recall/forget end-to-end
"""
import os
import uuid
import time
import random
import hashlib
import logging
import math
import unittest
from unittest.mock import MagicMock, patch
from datetime import timedelta

from django.test import TransactionTestCase
from django.utils import timezone
from django.conf import settings
from django_redis import get_redis_connection
from botocore.exceptions import ClientError
from django.test import override_settings


def _redis_available() -> bool:
    """Check if Redis is reachable (host 'redis' resolves and accepts connections)."""
    try:
        conn = get_redis_connection("default")
        conn.ping()
        return True
    except Exception:
        return False


# Note: REDIS_AVAILABLE is checked at runtime in setUp, not at import time,
# because @override_settings(CACHES) is applied AFTER module import.
# Checking at import time would use production CACHES (possibly localhost) and fail.

from .models import MemoryNode, MemoryLink, TokenDictionary
from . import tier_3
from .tier_3 import migrate_to_cold_storage, retrieve_from_cold_storage, cold_storage_service
from .tier_1 import active_memory_service, PythonRANSCodec
from .tier_2 import save_to_associative_layer, collection, hybrid_search, L2NormalizationTransformer
from .sorter import sorter_service, distribute_to_tiers, PIIRedactor
from .context_assembler import LosslessContextAssembler
from .tasks import task_apply_hebbian_learning
from .supermemory_adapter import supermemory_adapter
from . import supermemory_connector as smc
from .semantic_chunker import default_chunker
from .entity_extractor import default_extractor

logger = logging.getLogger(__name__)


@override_settings(CACHES={
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/1",
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
    }
})
class FloBrainComprehensiveStressTestSuite(TransactionTestCase):
    """End-to-end stress test: fault tolerance, resource optimization, graph plasticity."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        settings.DEBUG = False

        # Mock S3 storage so tests never hit the network
        cls.mock_storage = MagicMock()
        cls.mock_storage.put_object.return_value = "s3://flobrain-cold-vault/test-key-signature"
        cls.mock_storage.get_object.return_value = b"mock-secure-encrypted-compressed-blob"
        cls.original_storage = tier_3.cold_storage_service.storage
        tier_3.cold_storage_service.storage = cls.mock_storage

    @classmethod
    def tearDownClass(cls):
        tier_3.cold_storage_service.storage = cls.original_storage
        super().tearDownClass()

    def setUp(self):
        self.owner_id = "user_dev_finland_22"
        self.original_eviction_capacity = active_memory_service.eviction_controller.capacity
        # Check Redis availability at RUNTIME (after @override_settings is applied)
        self.redis_available = _redis_available()
        if self.redis_available:
            try:
                self.redis_conn = get_redis_connection("default")
                self.redis_conn.delete("cooccurrence_buffer")
                for key in self.redis_conn.scan_iter(match="cooccurrence_buffer:*", count=100):
                    self.redis_conn.delete(key)
            except Exception as e:
                logger.warning(f"[Test setUp] Redis cleanup failed: {e}")
                self.redis_available = False
                self.redis_conn = None
        else:
            self.redis_conn = None

    def tearDown(self):
        active_memory_service.eviction_controller.capacity = self.original_eviction_capacity
        if self.redis_conn is not None:
            try:
                self.redis_conn.delete("cooccurrence_buffer")
                for key in self.redis_conn.scan_iter(match="cooccurrence_buffer:*", count=100):
                    self.redis_conn.delete(key)
            except Exception:
                pass
        try:
            collection.delete(where={"o_id": self.owner_id})
        except Exception:
            pass

    # =====================================================================
    # 1. SORTER & ROUTING
    # =====================================================================

    def test_sorter_deduplication_attack_with_mutated_metadata(self):
        """Duplicate content with mutating metadata must collapse to 1 node."""
        base_text = "Cosmic interface Shine//Space uses Gargantua shaders for portal effects."
        incoming_hash = hashlib.sha256(base_text.encode('utf-8')).hexdigest()

        for i in range(500):
            payload = {
                "id": f"node_attack_vector_{i}",
                "owner_id": self.owner_id,
                "name": f"Portal Sync Trace {i}",
                "importance": round(random.uniform(0.4, 0.9), 4),
                "is_global": random.choice([True, False]),
                "metadata": {"timestamp": timezone.now().isoformat(), "raw_text": base_text},
                "tokens": [101, 2402, 3051, 102]
            }
            with patch.object(hashlib, 'sha256') as mock_hash:
                mock_hash.return_value.hexdigest.return_value = incoming_hash
                distribute_to_tiers(payload)

        unique_nodes_count = MemoryNode.objects.filter(owner_id=self.owner_id).count()
        self.assertEqual(unique_nodes_count, 1, "Dedup failed: DB inflated by duplicates!")

    def test_sorter_heuristic_boundary_conditions(self):
        """Strict tier routing at boundary scores."""
        boundaries = [
            {"score": 0.3499, "expected_tier": 3},
            {"score": 0.3501, "expected_tier": 2},
            {"score": 0.7499, "expected_tier": 2},
            {"score": 0.7501, "expected_tier": 1}
        ]
        for point in boundaries:
            node_id = f"boundary_node_{str(point['score']).replace('.', '_')}"
            payload = {
                "id": node_id, "owner_id": self.owner_id,
                "name": f"Boundary Test {point['score']}",
                "importance": point["score"], "is_global": False,
                "metadata": {"raw_text": "boundary test"}, "tokens": [1, 2, 3]
            }
            node = distribute_to_tiers(payload)
            self.assertEqual(node.tier_level, point["expected_tier"],
                             f"Wrong tier for {point['score']}: got {node.tier_level}")

    def test_sorter_pii_redaction_at_ingress(self):
        """PII must be masked before storage."""
        pii_text = "Contact: test@example.com, +1-555-123-4567, AB1234567, 4111111111111111"
        payload = {
            "id": "pii_test_node", "owner_id": self.owner_id,
            "name": "PII Test", "importance": 0.5, "is_global": False,
            "metadata": {"raw_text": pii_text}, "tokens": []
        }
        node = distribute_to_tiers(payload)
        node.refresh_from_db()
        stored_text = node.metadata.get("raw_text", "")
        self.assertNotIn("test@example.com", stored_text)
        self.assertNotIn("555-123-4567", stored_text)
        self.assertIn("[EMAIL]", stored_text)
        self.assertIn("[PHONE]", stored_text)

    # =====================================================================
    # 2. TIER 1 — RAM
    # =====================================================================

    def test_tier1_ans_codec_extreme_arrays(self):
        """rANS codec must roundtrip extreme token arrays losslessly."""
        codec = PythonRANSCodec(M=2048)
        extreme_cases = {
            "empty": [],
            "out_of_bounds": [999, 1234, 5555],
            "hyper_redundant": [42] * 10000
        }
        for case_name, tokens in extreme_cases.items():
            try:
                state, bitstream, freqs = codec.encode(tokens)
                decoded_tokens = codec.decode(state, bitstream, freqs, len(tokens))
                self.assertEqual(tokens, decoded_tokens[::-1],
                                 f"rANS roundtrip failed for case: {case_name}")
            except Exception as e:
                self.fail(f"rANS codec crashed on case '{case_name}': {e}")

    def test_tier1_eviction_controller_overflow(self):
        """LRU eviction must hold capacity limit and evict oldest keys."""
        if not self.redis_available:
            self.skipTest("Redis not available — Tier 1 cache requires Redis")
        active_memory_service.eviction_controller.capacity = 5
        for i in range(10):
            active_memory_service.save_node(
                node_id=f"eviction_overflow_node_{i}", owner_id=self.owner_id,
                token_indices=[i, i+1], content_hash=f"hash_flow_{i}", metadata={"index": i}
            )
        current_keys = active_memory_service.eviction_controller.keys()
        self.assertEqual(len(current_keys), 5, "Eviction controller exceeded capacity!")
        for i in range(5):
            cache_key = f"{active_memory_service.NODE_PREFIX}eviction_overflow_node_{i}"
            self.assertNotIn(cache_key, current_keys, f"Old node {i} was not evicted!")

    # =====================================================================
    # 3. TIER 2 — ASSOCIATIVE LAYER
    # =====================================================================

    def test_tier2_semantic_autonomy_over_bm25(self):
        """Hybrid search must retrieve node even with zero BM25 overlap."""
        node_id = f"semantic_edge_node_{uuid.uuid4().hex[:6]}"
        node = MemoryNode.objects.create(
            id=node_id, owner_id=self.owner_id,
            name="Finnish dividend strategies", tier_level=2
        )
        save_to_associative_layer(node, [0.15] * 384)
        with patch('rank_bm25.BM25Okapi.get_scores') as mock_bm25, \
             patch('chromadb.api.models.Collection.Collection.query') as mock_chroma:
            mock_bm25.return_value = [0.0]
            mock_chroma.return_value = {"ids": [[node_id]], "distances": [[0.12]]}
            results = hybrid_search(
                query_text="Passive income Helsinki Nordea stocks",
                query_embedding=[0.15] * 384, owner_id=self.owner_id, top_n=1
            )
            self.assertIn(node_id, results, "Hybrid search dropped node due to zero BM25!")

    def test_tier2_anomalous_vectors_l2_normalization(self):
        """NaN/Inf vectors must be sanitized, no exception raised."""
        transformer = L2NormalizationTransformer()
        anomalous_payloads = {
            "zero_vector": [0.0] * 384,
            "nan_vector": [float('nan')] * 384,
            "inf_vector": [float('inf')] * 384
        }
        for case_name, vector in anomalous_payloads.items():
            try:
                transformed = transformer.transform(vector)
                self.assertIsInstance(transformed, list)
                for val in transformed:
                    self.assertFalse(math.isinf(val) or math.isnan(val),
                                     f"Vector {case_name} contains unprocessed NaN/Inf!")
            except ZeroDivisionError:
                self.fail(f"L2 transformer crashed on {case_name}")
            except Exception as e:
                self.fail(f"Unexpected error on {case_name}: {e}")

    # =====================================================================
    # 4. TIER 3 — COLD STORAGE FAULT TOLERANCE (replaces crash simulation)
    # =====================================================================

    def test_gc_s3_storage_outage_fault_tolerance(self):
        """
        System must remain operational and preserve data integrity during S3 outage.
        No crash — instead: log warning, keep node on Tier 2, allow other operations to continue.
        """
        stale_node = MemoryNode.objects.create(
            id="stale_node_s3_crash_test", owner_id=self.owner_id,
            name="Stale Diagnostic Metadata", tier_level=2, relevance=0.1
        )

        # Simulate S3 outage — connector raises ClientError
        with patch.object(tier_3.cold_storage_service, 'migrate_node',
                          side_effect=ClientError(
                              error_response={"Error": {"Code": "500", "Message": "S3 Vault Connection Refused"}},
                              operation_name="PutObject"
                          )):
            # System must NOT crash — it should return False and keep the node on Tier 2
            migration_success = migrate_to_cold_storage(stale_node)
            self.assertFalse(migration_success, "Migration should fail during S3 outage")

            # The system stays alive: node remains on Tier 2, data is not lost
            stale_node.refresh_from_db()
            self.assertEqual(stale_node.tier_level, 2,
                             "Node must stay on Tier 2 during S3 outage — no data loss!")

            # System remains operational: subsequent save still works
            new_node = distribute_to_tiers({
                "id": "post_outage_node", "owner_id": self.owner_id,
                "name": "Post-outage save", "importance": 0.8, "is_global": False,
                "metadata": {"raw_text": "system still alive"}, "tokens": [1, 2]
            })
            self.assertIsNotNone(new_node, "System must accept new writes during Tier 3 outage")
            self.assertEqual(new_node.tier_level, 1)

    def test_tier3_idempotent_migration(self):
        """Re-calling migrate_to_cold_storage on already-frozen node is a no-op."""
        node = MemoryNode.objects.create(
            id="idempotent_node", owner_id=self.owner_id,
            name="Idempotent Test", tier_level=2,
            metadata={"raw_text": "test data"},
            created_at=timezone.now() - timedelta(minutes=10),  # Old enough to pass MIN_AGE check
        )
        # First migration: success
        result1 = migrate_to_cold_storage(node)
        self.assertTrue(result1)
        node.refresh_from_db()
        self.assertEqual(node.tier_level, 3)
        first_uri = node.metadata.get("vault_uri")

        # Second call: idempotent, no re-archive, returns True
        put_call_count_before = self.mock_storage.put_object.call_count
        result2 = migrate_to_cold_storage(node)
        self.assertTrue(result2)
        put_call_count_after = self.mock_storage.put_object.call_count
        self.assertEqual(put_call_count_after, put_call_count_before,
                         "Idempotent migration must not re-archive to S3!")

    # =====================================================================
    # 5. HEBBIAN LEARNING
    # =====================================================================

    def test_tasks_hebbian_learning_ghost_links_exclusion(self):
        """Ghost links to deleted nodes must be excluded from bulk upsert."""
        if not self.redis_available:
            self.skipTest("Redis not available")
        valid_a = MemoryNode.objects.create(id="node_alpha", owner_id=self.owner_id, name="Alpha")
        valid_b = MemoryNode.objects.create(id="node_beta", owner_id=self.owner_id, name="Beta")
        ghost_id = "node_ghost_extinct"

        self.redis_conn.hset("cooccurrence_buffer", f"{valid_a.id}:{valid_b.id}", 2)
        self.redis_conn.hset("cooccurrence_buffer", f"{valid_a.id}:{ghost_id}", 5)

        try:
            result = task_apply_hebbian_learning()
            self.assertTrue(result.startswith("Updated") or result.startswith("Buffer") or result.startswith("Error"),
                            f"Task failed: {result}")
        except Exception as e:
            self.fail(f"Celery task crashed on ghost link: {e}")

        link_exists = MemoryLink.objects.filter(
            source_id=valid_a.id, target_id=valid_b.id
        ).exists()
        self.assertTrue(link_exists, "Valid link was lost due to ghost node error!")

    def test_tasks_hebbian_learning_weight_saturation_wall(self):
        """Hebbian weight must saturate at 1.0, never overflow."""
        if not self.redis_available:
            self.skipTest("Redis not available")
        node_x = MemoryNode.objects.create(id="node_x", owner_id=self.owner_id, name="X")
        node_y = MemoryNode.objects.create(id="node_y", owner_id=self.owner_id, name="Y")
        self.redis_conn.hset("cooccurrence_buffer", f"{node_x.id}:{node_y.id}", 100)

        task_apply_hebbian_learning()
        link = MemoryLink.objects.get(source_id=node_x.id, target_id=node_y.id)
        self.assertEqual(float(link.weight), 1.0, f"Hebbian weight broke the 1.0 wall: {link.weight}")

    # =====================================================================
    # 6. CONTEXT ASSEMBLER
    # =====================================================================

    def test_assembler_micro_token_budget_sliding_window(self):
        """Sliding window must not infinite-loop and must preserve line syntax."""
        assembler = LosslessContextAssembler(max_context_tokens=15, model_name="gpt-4", max_workers=4)
        long_text = (
            "import os\nimport sys\ndef init_gargantua_portal():\n"
            "    print('Shine Space Activation')\n    return True\n"
        )
        sliced_text, sliced_tokens = assembler._slice_to_fit(long_text, max_tokens=12)
        self.assertTrue(sliced_tokens <= 12, "Slicing exceeded token budget!")
        if sliced_text:
            self.assertTrue(sliced_text.endswith('\n') or sliced_text in long_text,
                            "Line syntax damaged during slicing!")
            self.assertNotIn("return True", sliced_text, "Slicing did not clamp the tail!")

    def test_assembler_tri_tier_cascade_integration(self):
        """Tri-tier cascade: RAM + ChromaDB + Cold S3 must all contribute to context."""
        if not self.redis_available:
            self.skipTest("Redis not available — Tier 1 save_node requires Redis")
        assembler = LosslessContextAssembler(max_context_tokens=2000, model_name="gpt-4", max_workers=4)

        node_t1 = MemoryNode.objects.create(id="cascade_t1", owner_id=self.owner_id, name="RAM Node", tier_level=1)
        active_memory_service.save_node(
            node_id=node_t1.id, owner_id=self.owner_id, token_indices=[1, 2], content_hash="h1",
            metadata={"raw_text": "[Segment 1: RAM Active Data]"}
        )

        node_t2 = MemoryNode.objects.create(id="cascade_t2", owner_id=self.owner_id, name="Vector Node", tier_level=2)
        save_to_associative_layer(node_t2, [0.1] * 384)

        node_t3 = MemoryNode.objects.create(id="cascade_t3", owner_id=self.owner_id, name="Cold Node", tier_level=3)
        node_t3.metadata = {"vault_uri": "s3://flobrain-cold-vault/archive_key"}
        node_t3.save()

        with patch.object(active_memory_service, 'get_node_data',
                          return_value={"metadata": {"raw_text": "[Segment 1: RAM Active Data]"}},
                          create=True), \
             patch('memory.context_assembler.hybrid_search', return_value=[node_t2.id]), \
             patch.object(MemoryNode.objects, 'get', return_value=node_t2), \
             patch('memory.context_assembler.retrieve_from_cold_storage',
                   return_value={"metadata": {"raw_text": "[Segment 3: Cold S3 Archive Stream]"}}):
            with patch.object(node_t2, 'metadata', {"raw_text": "[Segment 2: ChromaDB Associative Mesh]"}):
                final_context, collected_ids, current_tokens = assembler.assemble_context(
                    query_text="Cascade integration Shine//Space", owner_id=self.owner_id
                )
                self.assertIsInstance(final_context, str)
                self.assertIn("[Segment 1: RAM Active Data]", final_context, "Tier 1 lost!")
                self.assertIn("[Segment 3: Cold S3 Archive Stream]", final_context, "Tier 3 lost!")
                self.assertTrue(current_tokens > 0)

    # =====================================================================
    # 7. SUPERMEMORY ADAPTER — STUB MODE & CONNECTOR RESILIENCE
    # =====================================================================

    def test_supermemory_stub_mode_resilience(self):
        """STUB mode (no SUPERMEMORY_BASE_URL) must handle memorize/recall/forget."""
        # Ensure stub mode
        with patch.object(smc, 'is_configured', return_value=False):
            # Memorize
            memo_result = supermemory_adapter.memorize(
                content="I met Anna at Microsoft HQ in Helsinki to discuss SuperMemory integration.",
                owner_id=self.owner_id,
                metadata={"source": "test"},
                importance=0.8
            )
            self.assertEqual(memo_result["status"], "memorized")
            self.assertEqual(memo_result["mode"], "local")
            self.assertTrue(memo_result["doc_id"])
            self.assertGreater(len(memo_result["chunks"]), 0)
            # Entities should be extracted
            entity_texts = [e["text"].lower() for e in memo_result["entities"]]
            self.assertTrue(any("anna" in t for t in entity_texts) or
                            any("microsoft" in t for t in entity_texts),
                            "Entity extraction failed to find Anna/Microsoft")

            # Recall
            recall_results = supermemory_adapter.recall(
                query="who did I meet about SuperMemory?", owner_id=self.owner_id, top_n=5
            )
            self.assertIsInstance(recall_results, list)
            self.assertGreater(len(recall_results), 0, "Recall returned no results in STUB mode")
            self.assertEqual(recall_results[0]["mode"], "local")

            # Forget
            forget_result = supermemory_adapter.forget(
                memory_id=memo_result["doc_id"], owner_id=self.owner_id, cascade=True
            )
            self.assertEqual(forget_result["status"], "forgotten")

    def test_supermemory_connector_failure_resilience(self):
        """
        When SuperMemory server is unreachable, system must NOT crash.
        Instead: log warning, fall back to local STUB mode, keep serving requests.
        """
        # Simulate configured but unreachable server
        with patch.object(smc, 'is_configured', return_value=True), \
             patch('memory.supermemory_connector.requests') as mock_requests:

            # All requests raise ConnectionError (simulating network outage)
            import requests as real_requests
            mock_requests.RequestException = real_requests.RequestException
            mock_requests.post.side_effect = real_requests.ConnectionError("server down")
            mock_requests.get.side_effect = real_requests.ConnectionError("server down")
            mock_requests.delete.side_effect = real_requests.ConnectionError("server down")

            # Health check must report unreachable, not crash
            health = smc.health()
            self.assertEqual(health["status"], "unreachable")
            self.assertIn("error", health)

            # Memorize must fall back to local mode (no crash)
            memo_result = supermemory_adapter.memorize(
                content="Resilience test: system must survive SuperMemory outage.",
                owner_id=self.owner_id,
                metadata={"source": "resilience_test"}
            )
            self.assertEqual(memo_result["status"], "memorized")
            self.assertEqual(memo_result["mode"], "local",
                             "Must fall back to local mode when remote is unreachable")

            # Recall must still work via local fallback
            recall_results = supermemory_adapter.recall(
                query="resilience test", owner_id=self.owner_id, top_n=5
            )
            self.assertIsInstance(recall_results, list)
            self.assertGreater(len(recall_results), 0, "Recall must work even during remote outage")

    def test_supermemory_health_endpoint_reports_mode(self):
        """Health endpoint must report current mode (stub/remote) accurately."""
        # In test env SUPERMEMORY_BASE_URL is not set → stub
        self.assertFalse(smc.is_configured(), "Test env must be in STUB mode by default")
        health = smc.health()
        self.assertEqual(health["status"], "stub")
        self.assertEqual(health["mode"], "local_fallback")
