import hashlib
import io
import json
import importlib
from pathlib import Path
from unittest.mock import MagicMock, patch

from django.core.management import call_command
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import SimpleTestCase, TestCase, TransactionTestCase, override_settings
from rest_framework.test import APIClient

from users.jwt_utils import make_access_token
from users.models import User

from . import tier_2, tier_3
from .models import MemoryLink, MemoryNode
from .sorter import content_hash_for
from .testing import FakeS3Client, IsolatedVectorStoreMixin


class MemoryRuntimeSafetyTestCase(IsolatedVectorStoreMixin, SimpleTestCase):
    def test_memory_app_discovers_only_real_test_modules(self):
        app_dir = Path(__file__).resolve().parent
        self.assertEqual(
            sorted(p.name for p in app_dir.glob("test*.py")),
            ["testing.py", "tests.py"],
        )
        self.assertTrue((app_dir / "scripts" / "mongo_demo.py").exists())

    def test_tier_modules_create_no_clients_at_import(self):
        with patch("chromadb.PersistentClient") as chroma_client, patch("boto3.client") as s3_client:
            importlib.reload(tier_2)
            importlib.reload(tier_3)

        chroma_client.assert_not_called()
        s3_client.assert_not_called()

    def test_vector_collection_uses_configured_path_and_name(self):
        tier_2.reset_vector_store()
        with patch("chromadb.PersistentClient") as chroma_client:
            tier_2.get_collection()
            tier_2.get_collection()

        chroma_client.assert_called_once()
        self.assertEqual(chroma_client.call_args.kwargs["path"], self.vector_db_path)
        self.assertFalse(chroma_client.call_args.kwargs["settings"].anonymized_telemetry)
        get_or_create = chroma_client.return_value.get_or_create_collection
        get_or_create.assert_called_once()
        self.assertEqual(get_or_create.call_args.kwargs["name"], self.vector_collection_name)
        tier_2.reset_vector_store()


class MemoryAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username="Memory Tester",
            email="memory@example.com",
            password_hash="unused",
        )
        token = make_access_token(str(self.user.id))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.node = MemoryNode.objects.create(
            id="node-primary",
            owner_id=str(self.user.id),
            name="Primary memory",
            memory_type="summary",
            relevance=0.75,
        )
        self.related_node = MemoryNode.objects.create(
            id="node-related",
            owner_id=str(self.user.id),
            name="Related memory",
            memory_type="interaction",
            relevance=0.5,
        )
        MemoryLink.objects.create(
            source=self.node,
            target=self.related_node,
            weight=0.8,
        )

    def test_graph_maps_api_visualization_fields_to_model_fields(self):
        response = self.client.get("/api/memory/graph/")

        self.assertEqual(response.status_code, 200)
        nodes = {node["id"]: node for node in response.json()["nodes"]}
        self.assertEqual(nodes[self.node.id]["val"], self.node.relevance)
        self.assertEqual(nodes[self.node.id]["group"], self.node.memory_type)

    def test_detail_maps_node_and_connection_fields(self):
        response = self.client.get(f"/api/memory/nodes/{self.node.id}/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["val"], self.node.relevance)
        self.assertEqual(data["group"], self.node.memory_type)
        self.assertEqual(
            data["connections"]["outgoing"][0]["group"],
            self.related_node.memory_type,
        )

    @patch("memory.views._log_memory_event")
    def test_patch_updates_only_real_model_fields(self, log_memory_event):
        response = self.client.patch(
            f"/api/memory/nodes/{self.node.id}/",
            {"name": "Updated memory", "memory_type": "workflow", "relevance": 0.9},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.node.refresh_from_db()
        self.assertEqual(self.node.name, "Updated memory")
        self.assertEqual(self.node.memory_type, "workflow")
        self.assertEqual(self.node.relevance, 0.9)
        log_memory_event.assert_called_once()

    def test_patch_rejects_nonexistent_legacy_model_fields(self):
        response = self.client.patch(
            f"/api/memory/nodes/{self.node.id}/",
            {"val": 10, "group": "legacy"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "No editable fields provided")


class MemoryOwnerIsolationTestCase(TestCase):
    """ACC-04: Bob can neither read, edit nor see Alice's memory nodes."""

    def setUp(self):
        self.alice = User.objects.create(
            username="Alice", email="alice@example.test", password_hash="unused"
        )
        self.bob = User.objects.create(
            username="Bob", email="bob@example.test", password_hash="unused"
        )
        self.alice_node = MemoryNode.objects.create(
            id="node-alice",
            owner_id=str(self.alice.id),
            name="Synthetic favourite tea is oolong-7731",
            memory_type="summary",
            relevance=0.75,
        )
        self.bob_node = MemoryNode.objects.create(
            id="node-bob",
            owner_id=str(self.bob.id),
            name="Synthetic favourite colour is teal-4410",
            memory_type="summary",
            relevance=0.5,
        )
        MemoryLink.objects.create(source=self.bob_node, target=self.alice_node, weight=0.8)
        MemoryLink.objects.create(source=self.alice_node, target=self.bob_node, weight=0.8)
        self.client = APIClient()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {make_access_token(str(self.bob.id))}"
        )

    def test_foreign_node_detail_is_not_found(self):
        response = self.client.get(f"/api/memory/nodes/{self.alice_node.id}/")

        self.assertEqual(response.status_code, 404)
        self.assertNotIn("oolong-7731", response.content.decode())

    def test_foreign_and_missing_nodes_return_identical_404(self):
        foreign = self.client.get(f"/api/memory/nodes/{self.alice_node.id}/")
        missing = self.client.get("/api/memory/nodes/node-does-not-exist/")

        self.assertEqual(foreign.status_code, 404)
        self.assertEqual(foreign.json(), missing.json())

    @patch("memory.views._log_memory_event")
    def test_foreign_node_patch_is_not_found_and_leaves_row_unchanged(self, log_memory_event):
        response = self.client.patch(
            f"/api/memory/nodes/{self.alice_node.id}/",
            {"name": "Overwritten by Bob", "relevance": 0.1},
            format="json",
        )

        self.assertEqual(response.status_code, 404)
        self.alice_node.refresh_from_db()
        self.assertEqual(self.alice_node.name, "Synthetic favourite tea is oolong-7731")
        self.assertEqual(self.alice_node.relevance, 0.75)
        log_memory_event.assert_not_called()

    def test_own_node_connections_exclude_foreign_nodes(self):
        response = self.client.get(f"/api/memory/nodes/{self.bob_node.id}/")

        self.assertEqual(response.status_code, 200)
        connections = response.json()["connections"]
        self.assertEqual(connections["outgoing"], [])
        self.assertEqual(connections["incoming"], [])
        self.assertEqual(connections["total"], 0)
        self.assertNotIn("oolong-7731", response.content.decode())

    def test_graph_lists_only_own_nodes_and_links(self):
        response = self.client.get("/api/memory/graph/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([n["id"] for n in response.json()["nodes"]], [self.bob_node.id])
        self.assertEqual(response.json()["links"], [])

    def test_memory_routes_require_valid_token(self):
        routes = [
            ("get", "/api/memory/graph/"),
            ("get", f"/api/memory/nodes/{self.alice_node.id}/"),
            ("patch", f"/api/memory/nodes/{self.alice_node.id}/"),
            ("post", "/api/memory/save/"),
        ]
        for credentials in ({}, {"HTTP_AUTHORIZATION": "Bearer not-a-valid-token"}):
            client = APIClient()
            client.credentials(**credentials)
            for method, url in routes:
                with self.subTest(method=method, url=url, credentials=bool(credentials)):
                    response = getattr(client, method)(url, {}, format="json")
                    self.assertEqual(response.status_code, 401)


TEST_AES_KEY = "ab" * 32  # synthetic test-only key


@patch("memory.views._log_memory_event")
class ColdArchiveSafetyTestCase(IsolatedVectorStoreMixin, TestCase):
    """ACC-09: cold archive is opt-in, needs a real key, and hydrates by vault_uri."""

    def setUp(self):
        super().setUp()
        tier_3.reset_cold_storage()
        self.addCleanup(tier_3.reset_cold_storage)
        self.alice = User.objects.create(
            username="Alice", email="alice@example.test", password_hash="unused"
        )
        self.client = APIClient()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {make_access_token(str(self.alice.id))}"
        )
        self.s3 = FakeS3Client()
        boto3_client = patch("memory.tier_3.boto3.client", return_value=self.s3)
        self.boto3_client = boto3_client.start()
        self.addCleanup(boto3_client.stop)

    def _save(self, name, importance):
        with self.captureOnCommitCallbacks(execute=True):
            return self.client.post(
                "/api/memory/save/",
                {"content": name, "importance": importance},
                format="json",
            )

    def _vector_ids(self):
        return tier_2.get_collection().get()["ids"]

    def test_disabled_archive_keeps_high_importance_save_in_tier_1_with_vector(self, _log):
        response = self._save("Synthetic favourite tea is oolong-7731", 0.9)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["tier"], 1)
        self.assertIn(response.json()["node_id"], self._vector_ids())
        self.boto3_client.assert_not_called()

    def test_disabled_archive_never_calls_s3_and_indexes_low_importance_save(self, _log):
        response = self._save("Synthetic old note is ember-2210", 0.1)

        self.assertEqual(response.status_code, 200)
        node = MemoryNode.objects.get(id=response.json()["node_id"])
        self.assertNotIn("vault_uri", node.metadata)
        self.assertIn(node.id, self._vector_ids())
        self.boto3_client.assert_not_called()

    def test_enabled_archive_with_missing_or_invalid_key_refuses_to_archive(self, _log):
        for key in ("", "0" * 63, "not-a-hex-key-" * 5):
            with self.subTest(key=key), override_settings(
                MEMORY_COLD_STORAGE_ENABLED=True, MEMORY_COLD_STORAGE_KEY=key
            ), patch("memory.tier_3.SecureCipher") as cipher:
                tier_3.reset_cold_storage()
                with self.assertLogs("memory.tier_3", level="ERROR"):
                    response = self._save(f"Synthetic archived note {len(key)}", 0.1)

                self.assertEqual(response.status_code, 200)
                self.assertTrue(MemoryNode.objects.filter(id=response.json()["node_id"]).exists())
                cipher.assert_not_called()
                self.boto3_client.assert_not_called()

    @override_settings(MEMORY_COLD_STORAGE_ENABLED=True, MEMORY_COLD_STORAGE_KEY=TEST_AES_KEY)
    def test_enabled_archive_routes_only_low_importance_saves_to_s3(self, _log):
        high = self._save("Synthetic favourite tea is oolong-7731", 0.9)
        self.assertEqual(high.json()["tier"], 1)
        self.assertEqual(self.s3.calls, [])

        low = self._save("Synthetic old note is ember-2210", 0.1)

        self.assertEqual(low.json()["tier"], 3)
        node = MemoryNode.objects.get(id=low.json()["node_id"])
        self.assertTrue(node.metadata["vault_uri"].startswith("s3://"))
        self.assertEqual([call[0] for call in self.s3.calls], ["put_object"])

    @override_settings(MEMORY_COLD_STORAGE_ENABLED=True, MEMORY_COLD_STORAGE_KEY=TEST_AES_KEY)
    def test_failed_archive_upload_keeps_the_node_out_of_tier_3(self, _log):
        """ACC-08 row 5: S3 put fails → save 200, node not tier 3, still indexed, error logged."""
        self.s3.put_object = MagicMock(side_effect=RuntimeError("synthetic S3 outage"))

        with self.assertLogs("memory.tier_3", level="ERROR"):
            response = self._save("Synthetic old note is ember-2210", 0.1)

        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.json()["tier"], 3)
        node = MemoryNode.objects.get(id=response.json()["node_id"])
        self.assertNotEqual(node.tier_level, 3)
        self.assertNotIn("vault_uri", node.metadata)
        self.assertEqual(node.index_status, MemoryNode.INDEX_INDEXED)
        self.assertIn(node.id, self._vector_ids())

    @override_settings(MEMORY_COLD_STORAGE_ENABLED=True, MEMORY_COLD_STORAGE_KEY=TEST_AES_KEY)
    def test_hydration_reads_archive_only_text_through_vault_uri(self, _log):
        node = MemoryNode.objects.create(
            id="node-archived",
            owner_id=str(self.alice.id),
            name="archived",
            tier_level=1,
            metadata={"raw_text": "Synthetic favourite tea is oolong-7731"},
        )
        self.assertTrue(tier_3.migrate_to_cold_storage(node))
        # Remove every SQL copy of the text so only the archive holds it
        node.metadata.pop("raw_text")
        MemoryNode.objects.filter(id=node.id).update(metadata=node.metadata, content="")

        # Retrieval found the node, but its SQL copy of the text is empty
        with patch("memory.context_assembler.retrieve_memories", return_value=[("node-archived", "", 0.9)]):
            from .context_assembler import LosslessContextAssembler

            context, ids, _tokens = LosslessContextAssembler().assemble_context(
                "Which tea do I like?", owner_id=str(self.alice.id)
            )

        self.assertIn("oolong-7731", context)
        self.assertEqual(ids, ["node-archived"])


class MemorySchemaTestCase(TestCase):
    """T04: canonical content, provenance, exclusion, supersession and index state."""

    def test_new_node_has_lifecycle_defaults_and_mirrors_content(self):
        node = MemoryNode.objects.create(
            id="node-schema",
            owner_id="owner-a",
            name="Tea preference",
            content="Synthetic favourite tea is oolong-7731",
        )

        node.refresh_from_db()
        self.assertFalse(node.is_excluded)
        self.assertIsNone(node.superseded_by)
        self.assertIsNone(node.source_chat_id)
        self.assertIsNone(node.source_message_id)
        self.assertEqual(node.index_status, "pending")
        self.assertEqual(node.index_error, "")
        self.assertEqual(node.metadata["raw_text"], "Synthetic favourite tea is oolong-7731")

    def test_content_defaults_to_raw_text_then_name(self):
        from_raw = MemoryNode.objects.create(
            id="node-raw", name="Title", metadata={"raw_text": "Synthetic raw text"}
        )
        from_name = MemoryNode.objects.create(id="node-name", name="Synthetic title only")

        self.assertEqual(from_raw.content, "Synthetic raw text")
        self.assertEqual(from_name.content, "Synthetic title only")

    def test_superseded_by_is_cleared_when_replacement_is_deleted(self):
        replacement = MemoryNode.objects.create(id="node-new", owner_id="owner-a", content="new")
        old = MemoryNode.objects.create(
            id="node-old", owner_id="owner-a", content="old", superseded_by=replacement
        )

        replacement.delete()

        old.refresh_from_db()
        self.assertIsNone(old.superseded_by)

    def test_source_message_is_unique_per_owner_when_set(self):
        from django.db import IntegrityError, transaction

        MemoryNode.objects.create(id="m1", owner_id="owner-a", content="a", source_message_id=7)
        MemoryNode.objects.create(id="m2", owner_id="owner-b", content="b", source_message_id=7)
        MemoryNode.objects.create(id="m3", owner_id="owner-a", content="c")
        MemoryNode.objects.create(id="m4", owner_id="owner-a", content="d")

        with self.assertRaises(IntegrityError), transaction.atomic():
            MemoryNode.objects.create(id="m5", owner_id="owner-a", content="e", source_message_id=7)


class MemorySchemaMigrationTestCase(TransactionTestCase):
    """T04: 0002 applies, backfills content/content_hash, and reverses."""

    before = [("memory", "0001_initial")]
    after = [("memory", "0002_memory_lifecycle_fields")]

    def _migrate(self, targets):
        executor = MigrationExecutor(connection)
        executor.loader.build_graph()
        executor.migrate(targets)
        return executor.loader.project_state(targets).apps

    def tearDown(self):
        self._migrate(MigrationExecutor(connection).loader.graph.leaf_nodes())

    def test_forward_backfill_and_reverse(self):
        old_apps = self._migrate(self.before)
        OldNode = old_apps.get_model("memory", "MemoryNode")
        OldNode.objects.create(id="with-raw", name="Title", metadata={"raw_text": "Synthetic tea is oolong-7731"})
        OldNode.objects.create(id="name-only", name="Synthetic name only", metadata={})
        OldNode.objects.create(id="empty", name="", metadata={})

        new_apps = self._migrate(self.after)
        NewNode = new_apps.get_model("memory", "MemoryNode")
        expected = {
            "with-raw": "Synthetic tea is oolong-7731",
            "name-only": "Synthetic name only",
            "empty": "",
        }
        for node_id, content in expected.items():
            node = NewNode.objects.get(id=node_id)
            self.assertEqual(node.content, content)
            self.assertEqual(node.content_hash, content_hash_for(content))
            self.assertEqual(node.index_status, "pending")
            self.assertFalse(node.is_excluded)

        reverted_apps = self._migrate(self.before)
        reverted_fields = {f.name for f in reverted_apps.get_model("memory", "MemoryNode")._meta.get_fields()}
        self.assertNotIn("content", reverted_fields)
        self.assertEqual(reverted_apps.get_model("memory", "MemoryNode").objects.count(), 3)


class MemoryVectorIndexTestCase(IsolatedVectorStoreMixin, TestCase):
    """T05: server-side embedding, versioned collection, owner-scoped query."""

    def setUp(self):
        super().setUp()
        self.alice = User.objects.create(
            username="Alice", email="alice@example.test", password_hash="unused"
        )
        self.bob = User.objects.create(
            username="Bob", email="bob@example.test", password_hash="unused"
        )
        self.client = APIClient()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {make_access_token(str(self.alice.id))}"
        )

    def _node(self, node_id, owner, content):
        return MemoryNode.objects.create(id=node_id, owner_id=str(owner.id), content=content)

    @patch("memory.views._log_memory_event")
    def test_save_without_client_embedding_is_indexed_and_owner_queryable(self, _log):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                "/api/memory/save/",
                {"content": "Synthetic favourite tea is oolong-7731", "importance": 0.9},
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        node = MemoryNode.objects.get(id=response.json()["node_id"])
        self.assertEqual(node.index_status, MemoryNode.INDEX_INDEXED)
        alice_hits = [nid for nid, _ in tier_2.query_owner_vectors(str(self.alice.id), "which tea is my favourite")]
        self.assertEqual(alice_hits, [node.id])
        self.assertEqual(tier_2.query_owner_vectors(str(self.bob.id), "which tea is my favourite"), [])

    def test_vector_metadata_records_owner_and_type(self):
        node = self._node("node-tea", self.alice, "Synthetic favourite tea is oolong-7731")

        self.assertTrue(tier_2.index_node(node))

        stored = tier_2.get_collection().get(ids=[node.id], include=["metadatas", "documents"])
        self.assertEqual(stored["metadatas"][0], {"o_id": str(self.alice.id), "memory_type": "chunk"})
        self.assertEqual(stored["documents"][0], "Synthetic favourite tea is oolong-7731")

    def test_reindexing_same_node_does_not_duplicate(self):
        node = self._node("node-tea", self.alice, "Synthetic favourite tea is oolong-7731")

        tier_2.index_node(node)
        node.content = "Synthetic favourite tea is sencha-1188"
        node.save()
        tier_2.index_node(node)

        self.assertEqual(tier_2.get_collection().count(), 1)
        stored = tier_2.get_collection().get(ids=[node.id], include=["documents"])
        self.assertEqual(stored["documents"][0], "Synthetic favourite tea is sencha-1188")

    def test_embedding_failure_marks_node_failed_without_raising(self):
        node = self._node("node-tea", self.alice, "Synthetic favourite tea is oolong-7731")
        with override_settings(
            MEMORY_EMBEDDING_FUNCTION="memory.testing.FailingEmbeddingFunction",
            MEMORY_VECTOR_COLLECTION="test_memory_failing",
        ):
            tier_2.reset_vector_store()
            with self.assertLogs("memory.tier_2", level="ERROR"):
                result = tier_2.index_node(node)

        self.assertFalse(result)
        node.refresh_from_db()
        self.assertEqual(node.index_status, MemoryNode.INDEX_FAILED)
        self.assertIn("synthetic embedding failure", node.index_error)

    def test_delete_vectors_by_id_and_by_owner(self):
        tea = self._node("node-tea", self.alice, "Synthetic favourite tea is oolong-7731")
        bike = self._node("node-bike", self.alice, "Synthetic bike lock code note")
        bob_note = self._node("node-bob", self.bob, "Synthetic favourite colour is teal-4410")
        for node in (tea, bike, bob_note):
            tier_2.index_node(node)

        tier_2.delete_vectors(ids=[tea.id])
        self.assertEqual(sorted(tier_2.get_collection().get()["ids"]), ["node-bike", "node-bob"])

        tier_2.delete_vectors(owner_id=str(self.alice.id))
        self.assertEqual(tier_2.get_collection().get()["ids"], ["node-bob"])

    def test_tests_use_fake_embedding_function(self):
        from .testing import FakeEmbeddingFunction

        self.assertIsInstance(tier_2.get_embedding_function(), FakeEmbeddingFunction)


@patch("memory.views._log_memory_event")
class MemorySaveContractTestCase(IsolatedVectorStoreMixin, TestCase):
    """T06: validated payload, server IDs, content dedup, owner-checked supersedes, honest status."""

    def setUp(self):
        super().setUp()
        self.alice = User.objects.create(
            username="Alice", email="alice@example.test", password_hash="unused"
        )
        self.bob = User.objects.create(
            username="Bob", email="bob@example.test", password_hash="unused"
        )
        self.alice_node = MemoryNode.objects.create(
            id="node-alice", owner_id=str(self.alice.id), content="Synthetic favourite tea is oolong-7731"
        )

    def _client(self, user):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {make_access_token(str(user.id))}")
        return client

    def _save(self, user, payload):
        return self._client(user).post("/api/memory/save/", payload, format="json")

    def test_invalid_payloads_return_400(self, _log):
        invalid = [
            {},
            {"content": ""},
            {"content": "x" * 10001},
            {"content": "ok", "memory_type": "not-a-type"},
            {"content": "ok", "importance": 1.5},
            {"content": "ok", "importance": -0.1},
            {"content": "ok", "metadata": "not-a-dict"},
            {"content": "ok", "metadata": {"blob": "x" * 5000}},
        ]
        for payload in invalid:
            with self.subTest(payload=str(payload)[:60]):
                response = self._save(self.alice, payload)
                self.assertEqual(response.status_code, 400)
        self.assertEqual(MemoryNode.objects.count(), 1)

    def test_spoofed_owner_and_id_are_ignored(self, _log):
        response = self._save(
            self.bob,
            {
                "content": "Synthetic favourite colour is teal-4410",
                "owner_id": str(self.alice.id),
                "id": "node-alice",
                "embedding": [0.5] * 8,
            },
        )

        self.assertEqual(response.status_code, 200)
        node_id = response.json()["node_id"]
        self.assertNotEqual(node_id, "node-alice")
        self.assertEqual(MemoryNode.objects.get(id=node_id).owner_id, str(self.bob.id))
        self.alice_node.refresh_from_db()
        self.assertEqual(self.alice_node.owner_id, str(self.alice.id))
        self.assertEqual(self.alice_node.content, "Synthetic favourite tea is oolong-7731")

    def test_supersedes_foreign_node_is_rejected(self, _log):
        response = self._save(
            self.bob, {"content": "Synthetic replacement", "supersedes": "node-alice"}
        )

        self.assertEqual(response.status_code, 404)
        self.alice_node.refresh_from_db()
        self.assertIsNone(self.alice_node.superseded_by)
        self.assertFalse(MemoryNode.objects.filter(owner_id=str(self.bob.id)).exists())

    def test_supersedes_own_node_links_replacement(self, _log):
        response = self._save(
            self.alice, {"content": "Synthetic favourite tea is sencha-1188", "supersedes": "node-alice"}
        )

        self.assertEqual(response.status_code, 200)
        self.alice_node.refresh_from_db()
        self.assertEqual(self.alice_node.superseded_by_id, response.json()["node_id"])

    def test_identical_repeated_save_is_deduplicated(self, _log):
        first = self._save(self.alice, {"content": "Synthetic bike lock code note"})
        second = self._save(self.alice, {"content": "  synthetic BIKE lock   code note "})

        self.assertEqual(first.json()["deduplicated"], False)
        self.assertEqual(second.json()["deduplicated"], True)
        self.assertEqual(first.json()["node_id"], second.json()["node_id"])
        self.assertEqual(MemoryNode.objects.filter(owner_id=str(self.alice.id)).count(), 2)
        self.assertEqual(tier_2.get_collection().get(ids=[first.json()["node_id"]])["ids"], [first.json()["node_id"]])
        self.assertEqual(tier_2.get_collection().count(), 1)

    def test_same_title_different_content_creates_distinct_nodes(self, _log):
        first = self._save(self.alice, {"name": "Tea", "content": "Synthetic tea is oolong-7731"})
        second = self._save(self.alice, {"name": "Tea", "content": "Synthetic tea is sencha-1188"})

        self.assertNotEqual(first.json()["node_id"], second.json()["node_id"])
        self.assertFalse(second.json()["deduplicated"])

    def test_memory_type_is_forwarded_and_name_defaults_to_content(self, _log):
        content = "Synthetic workflow step " + "x" * 200
        response = self._save(self.alice, {"content": content, "memory_type": "workflow"})

        node = MemoryNode.objects.get(id=response.json()["node_id"])
        self.assertEqual(node.memory_type, "workflow")
        self.assertEqual(node.content, content)
        self.assertTrue(content.startswith(node.name.rstrip("…")))
        self.assertLessEqual(len(node.name), 81)

    def test_successful_save_reports_indexed(self, _log):
        response = self._save(self.alice, {"content": "Synthetic favourite colour is teal-4410"})

        body = response.json()
        self.assertEqual(body["status"], "saved")
        self.assertEqual(body["index_status"], "indexed")
        for key in ("binary_index", "tier", "node_id"):
            self.assertIn(key, body)

    def test_index_failure_is_visible_in_response_and_row(self, _log):
        with override_settings(
            MEMORY_EMBEDDING_FUNCTION="memory.testing.FailingEmbeddingFunction",
            MEMORY_VECTOR_COLLECTION="test_memory_failing",
        ):
            tier_2.reset_vector_store()
            with self.assertLogs("memory.tier_2", level="ERROR"):
                response = self._save(self.alice, {"content": "Synthetic note that fails to index"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["index_status"], "failed")
        node = MemoryNode.objects.get(id=response.json()["node_id"])
        self.assertEqual(node.index_status, MemoryNode.INDEX_FAILED)


@override_settings(MEMORY_MIN_RELEVANCE=0.2, MEMORY_RETRIEVAL_LIMIT=5)
class MemoryRetrievalTestCase(IsolatedVectorStoreMixin, TestCase):
    """T07: owner-scoped hybrid retrieval with eligibility gate, fallback and threshold."""

    def setUp(self):
        super().setUp()
        self.alice = User.objects.create(
            username="Alice", email="alice@example.test", password_hash="unused"
        )
        self.bob = User.objects.create(
            username="Bob", email="bob@example.test", password_hash="unused"
        )
        self.alice_id, self.bob_id = str(self.alice.id), str(self.bob.id)
        self.tea = self._memory(self.alice_id, "node-tea", "Synthetic favourite tea is oolong-7731")
        self.bike = self._memory(self.alice_id, "node-bike", "Synthetic bike lock code note")

    def _memory(self, owner_id, node_id, content, **fields):
        node = MemoryNode.objects.create(id=node_id, owner_id=owner_id, content=content, **fields)
        tier_2.index_node(node)
        return node

    def _ids(self, results):
        return [node_id for node_id, _content, _score in results]

    def test_related_query_returns_only_the_relevant_memory(self):
        results = tier_2.retrieve_memories(self.alice_id, "Which tea do I like?")

        self.assertEqual(self._ids(results), ["node-tea"])
        self.assertEqual(results[0][1], "Synthetic favourite tea is oolong-7731")

    def test_unrelated_query_abstains(self):
        results = tier_2.retrieve_memories(
            self.alice_id, "Summarize the plot of a synthetic novel about whales."
        )

        self.assertEqual(results, [])

    def test_excluded_and_superseded_rows_are_not_returned_despite_stale_vectors(self):
        replacement = self._memory(self.alice_id, "node-tea-new", "Synthetic favourite tea is sencha-1188")
        MemoryNode.objects.filter(id="node-tea").update(superseded_by=replacement)
        self._memory(self.alice_id, "node-tea-hidden", "Synthetic tea note hidden", is_excluded=True)

        results = tier_2.retrieve_memories(self.alice_id, "favourite tea")

        self.assertEqual(self._ids(results), ["node-tea-new"])
        self.assertIn("node-tea", tier_2.get_collection().get()["ids"])

    def test_deleted_row_with_stale_vector_is_not_returned(self):
        MemoryNode.objects.filter(id="node-tea").delete()

        self.assertEqual(tier_2.retrieve_memories(self.alice_id, "favourite tea"), [])

    def test_foreign_ids_from_vector_store_are_dropped_by_sql_join(self):
        self._memory(self.bob_id, "node-bob-tea", "Synthetic favourite tea is matcha-5512")
        # Simulate a mislabelled vector that claims to belong to Alice
        tier_2.get_collection().upsert(
            ids=["node-bob-tea"],
            documents=["Synthetic favourite tea is matcha-5512"],
            metadatas=[{"o_id": self.alice_id, "memory_type": "chunk"}],
        )

        results = tier_2.retrieve_memories(self.alice_id, "favourite tea")

        self.assertNotIn("node-bob-tea", self._ids(results))
        self.assertEqual(self._ids(tier_2.retrieve_memories(self.bob_id, "favourite tea")), ["node-bob-tea"])

    def test_vector_outage_still_returns_lexical_matches(self):
        with patch("memory.tier_2.query_owner_vectors", side_effect=RuntimeError("chroma down")), \
                self.assertLogs("memory.tier_2", level="WARNING"):
            results = tier_2.retrieve_memories(self.alice_id, "Which tea do I like?")

        self.assertEqual(self._ids(results), ["node-tea"])

    def test_lexical_failure_still_returns_vector_matches(self):
        with patch("memory.tier_2._lexical_scores", side_effect=RuntimeError("bm25 broke")), \
                self.assertLogs("memory.tier_2", level="WARNING"):
            results = tier_2.retrieve_memories(self.alice_id, "favourite tea oolong")

        self.assertEqual(self._ids(results), ["node-tea"])

    def test_exclude_ids_and_limit(self):
        for i in range(4):
            self._memory(self.alice_id, f"node-tea-{i}", f"Synthetic tea note number {i}")

        results = tier_2.retrieve_memories(self.alice_id, "tea", limit=2, exclude_ids=["node-tea"])

        self.assertEqual(len(results), 2)
        self.assertNotIn("node-tea", self._ids(results))


@override_settings(MEMORY_MIN_RELEVANCE=0.1, MEMORY_TOKENIZER="estimate")
class MemoryContextAssemblyTestCase(IsolatedVectorStoreMixin, TestCase):
    """T07/ACC-12 (assembler part): budgeted, framed, query-dependent memory block."""

    def setUp(self):
        super().setUp()
        self.alice_id = str(
            User.objects.create(username="Alice", email="alice@example.test", password_hash="unused").id
        )

    def _assembler(self):
        from .context_assembler import LosslessContextAssembler

        return LosslessContextAssembler()

    def test_block_including_framing_fits_the_budget(self):
        from .context_assembler import count_tokens

        for i in range(20):
            node = MemoryNode.objects.create(
                id=f"node-tea-{i}",
                owner_id=self.alice_id,
                content=f"Synthetic tea memory {i}: steeped leaves",
            )
            tier_2.index_node(node)

        block, ids, tokens = self._assembler().assemble_context("tea", owner_id=self.alice_id, budget=50)

        self.assertTrue(ids)
        self.assertLessEqual(count_tokens(block), 50)
        self.assertEqual(tokens, count_tokens(block))
        for node_id in ids:
            self.assertIn(MemoryNode.objects.get(id=node_id).content, block)

    def test_query_independent_recent_nodes_are_not_included(self):
        node = MemoryNode.objects.create(
            id="node-recent", owner_id=self.alice_id, content="Synthetic bike lock code note", tier_level=1
        )
        tier_2.index_node(node)

        block, ids, tokens = self._assembler().assemble_context(
            "Summarize the plot of a novel about whales", owner_id=self.alice_id, budget=500
        )

        self.assertEqual((block, ids, tokens), ("", [], 0))

    def test_offline_counter_overestimates_and_tiktoken_failure_falls_back(self):
        import math
        import re

        from .context_assembler import count_tokens

        text = "Synthetic favourite tea is oolong-7731, brewed at 85°C — naïve café notes."
        estimate = count_tokens(text)
        self.assertGreaterEqual(estimate, len(re.findall(r"\w+|[^\w\s]", text)))
        self.assertGreaterEqual(estimate, math.ceil(len(text) / 4))

        with override_settings(MEMORY_TOKENIZER="tiktoken"), \
                patch("memory.context_assembler.tiktoken.get_encoding", side_effect=OSError("no network")):
            self.assertEqual(count_tokens(text), estimate)


@override_settings(MEMORY_MIN_RELEVANCE=0.2, MEMORY_AUTO_CAPTURE=False, MEMORY_RECALL_ENABLED=True)
class MemoryCorrectionTestCase(IsolatedVectorStoreMixin, TestCase):
    """T10: ACC-03 (correction and supersession) and ACC-08 row 4 (Mongo outage on PATCH)."""

    OLD = "Synthetic favourite colour is blue-19"
    NEW = "Synthetic favourite colour is green-42"

    def setUp(self):
        super().setUp()
        self.alice = User.objects.create(username="Alice", email="alice@example.test", password_hash="unused")
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {make_access_token(str(self.alice.id))}")
        mongo = patch("memory.views.mongo_db")
        self.mongo = mongo.start()
        self.addCleanup(mongo.stop)
        self.node_id = self._save({"content": self.OLD})["node_id"]

    def _save(self, payload):
        response = self.client.post("/api/memory/save/", payload, format="json")
        self.assertEqual(response.status_code, 200)
        return response.json()

    def _patch(self, payload, node_id=None):
        return self.client.patch(f"/api/memory/nodes/{node_id or self.node_id}/", payload, format="json")

    def _chat_input(self, text="What is my favourite colour?"):
        from brain.models import Chat
        from brain.testing import capture_multimodal_requests

        chat = Chat.objects.create(user=self.alice)
        with capture_multimodal_requests() as requests:
            response = self.client.post(f"/api/brain/chats/{chat.id}/send/", {"text": text}, format="json")
        self.assertEqual(response.status_code, 200)
        return requests[0]["text_input"]

    def test_patch_content_updates_sql_vector_and_recall(self):
        response = self._patch({"content": self.NEW})

        self.assertEqual(response.status_code, 200)
        node = MemoryNode.objects.get(id=self.node_id)
        self.assertEqual(node.content, self.NEW)
        self.assertEqual(node.content_hash, content_hash_for(self.NEW))
        self.assertEqual(node.metadata["raw_text"], self.NEW)
        self.assertEqual(node.index_status, MemoryNode.INDEX_INDEXED)
        stored = tier_2.get_collection().get(ids=[self.node_id], include=["documents"])
        self.assertEqual(stored["documents"], [self.NEW])
        self.assertEqual(
            [content for _id, content, _score in tier_2.retrieve_memories(str(self.alice.id), "favourite colour")],
            [self.NEW],
        )

    def test_corrected_value_reaches_the_next_chat_and_old_value_does_not(self):
        self._patch({"content": self.NEW})

        text_input = self._chat_input()

        self.assertIn("green-42", text_input)
        self.assertNotIn("blue-19", text_input)

    def test_superseding_save_hides_the_old_value_from_chat(self):
        self._save({"content": self.NEW, "supersedes": self.node_id})

        text_input = self._chat_input()

        self.assertIn("green-42", text_input)
        self.assertNotIn("blue-19", text_input)
        self.assertNotIn(self.node_id, [nid for nid, _c, _s in tier_2.retrieve_memories(str(self.alice.id), "favourite colour")])

    def test_event_log_records_field_names_and_ids_only(self):
        self._patch({"content": self.NEW, "name": "Colour"})

        payload = self.mongo.workflow_events.insert_one.call_args.args[0]["payload"]
        self.assertEqual(payload, {"memory_node_id": self.node_id, "fields": ["content", "name"]})
        self.assertNotIn("blue-19", str(payload))
        self.assertNotIn("green-42", str(payload))

    def test_mongo_outage_during_patch_still_returns_200(self):
        self.mongo.workflow_events.insert_one.side_effect = RuntimeError("mongo down")

        with self.assertLogs("memory.views", level="WARNING"):
            response = self._patch({"content": self.NEW})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(MemoryNode.objects.get(id=self.node_id).content, self.NEW)

    def test_invalid_content_is_rejected(self):
        for content in ("", "   ", "x" * 10001, 42):
            with self.subTest(content=str(content)[:20]):
                self.assertEqual(self._patch({"content": content}).status_code, 400)
        self.assertEqual(MemoryNode.objects.get(id=self.node_id).content, self.OLD)

    def test_content_change_evicts_the_tier1_cache_entry(self):
        with patch("memory.views.evict_from_active_buffer") as evict:
            self._patch({"content": self.NEW})

        evict.assert_called_once_with(self.node_id)

    @override_settings(MEMORY_COLD_STORAGE_ENABLED=True, MEMORY_COLD_STORAGE_KEY=TEST_AES_KEY)
    def test_content_change_replaces_the_archive_blob(self):
        s3 = FakeS3Client()
        tier_3.reset_cold_storage()
        self.addCleanup(tier_3.reset_cold_storage)
        with patch("memory.tier_3.boto3.client", return_value=s3):
            archived_id = self._save({"content": "Synthetic old archived note ember-2210", "importance": 0.1})["node_id"]
            old_uri = MemoryNode.objects.get(id=archived_id).metadata["vault_uri"]

            self.assertEqual(self._patch({"content": "Synthetic old archived note ember-3321"}, archived_id).status_code, 200)
            node = MemoryNode.objects.get(id=archived_id)
            restored = tier_3.retrieve_from_cold_storage(node.metadata["vault_uri"])

        self.assertNotEqual(node.metadata["vault_uri"], old_uri)
        self.assertIn(("delete_object", "flobrain-cold-vault", old_uri.split("/", 3)[3]), s3.calls)
        self.assertEqual(len(s3.objects), 1)
        self.assertEqual(restored["metadata"]["raw_text"], "Synthetic old archived note ember-3321")


@override_settings(MEMORY_MIN_RELEVANCE=0.2, MEMORY_AUTO_CAPTURE=False, MEMORY_RECALL_ENABLED=True)
class MemoryExcludeDeleteTestCase(IsolatedVectorStoreMixin, TestCase):
    """T11 backend: ACC-05 (a, b, c without reconcile), ACC-04 rows 7-8, FM-17 detail fields."""

    FACT = "Synthetic favourite tea is oolong-7731"

    def setUp(self):
        super().setUp()
        self.alice = User.objects.create(username="Alice", email="alice@example.test", password_hash="unused")
        self.bob = User.objects.create(username="Bob", email="bob@example.test", password_hash="unused")
        mongo = patch("memory.views.mongo_db")
        self.mongo = mongo.start()
        self.addCleanup(mongo.stop)
        self.node_id = self._client(self.alice).post(
            "/api/memory/save/", {"content": self.FACT}, format="json"
        ).json()["node_id"]
        other = MemoryNode.objects.create(id="node-other", owner_id=str(self.alice.id), content="Synthetic linked note")
        MemoryLink.objects.create(source_id=self.node_id, target=other, weight=0.5)

    def _client(self, user):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {make_access_token(str(user.id))}")
        return client

    def _delete(self, user, node_id=None):
        with self.captureOnCommitCallbacks(execute=True):
            return self._client(user).delete(f"/api/memory/nodes/{node_id or self.node_id}/")

    def _chat_input(self):
        from brain.models import Chat
        from brain.testing import capture_multimodal_requests

        chat = Chat.objects.create(user=self.alice)
        with capture_multimodal_requests() as requests:
            response = self._client(self.alice).post(
                f"/api/brain/chats/{chat.id}/send/", {"text": "Which tea do I like?"}, format="json"
            )
        self.assertEqual(response.status_code, 200)
        return requests[0]["text_input"]

    def test_detail_returns_content_and_lifecycle_state(self):
        data = self._client(self.alice).get(f"/api/memory/nodes/{self.node_id}/").json()

        self.assertEqual(data["content"], self.FACT)
        self.assertFalse(data["is_excluded"])
        self.assertEqual(data["index_status"], "indexed")

    def test_exclude_hides_memory_until_reincluded(self):
        self.assertIn("oolong-7731", self._chat_input())

        response = self._client(self.alice).patch(
            f"/api/memory/nodes/{self.node_id}/", {"is_excluded": True}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["is_excluded"])
        self.assertNotIn("oolong-7731", self._chat_input())
        self.assertEqual(tier_2.retrieve_memories(str(self.alice.id), "favourite tea"), [])

        self._client(self.alice).patch(f"/api/memory/nodes/{self.node_id}/", {"is_excluded": False}, format="json")
        self.assertIn("oolong-7731", self._chat_input())

    def test_is_excluded_must_be_a_boolean(self):
        response = self._client(self.alice).patch(
            f"/api/memory/nodes/{self.node_id}/", {"is_excluded": "yes"}, format="json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(MemoryNode.objects.get(id=self.node_id).is_excluded)

    def test_delete_removes_row_links_and_vector_and_is_never_recalled(self):
        response = self._delete(self.alice)

        self.assertEqual(response.status_code, 204)
        self.assertFalse(MemoryNode.objects.filter(id=self.node_id).exists())
        self.assertFalse(MemoryLink.objects.filter(source_id=self.node_id).exists())
        self.assertNotIn(self.node_id, tier_2.get_collection().get()["ids"])
        self.assertNotIn("oolong-7731", self._chat_input())
        payload = self.mongo.workflow_events.insert_one.call_args.args[0]["payload"]
        self.assertEqual(payload, {"memory_node_id": self.node_id})

    def test_failed_vector_delete_still_never_recalls_the_memory(self):
        with patch("memory.views.delete_vectors", return_value=False):
            response = self._delete(self.alice)

        self.assertEqual(response.status_code, 204)
        self.assertIn(self.node_id, tier_2.get_collection().get()["ids"])  # orphan left for reconcile (T13)
        self.assertEqual(tier_2.retrieve_memories(str(self.alice.id), "favourite tea"), [])
        self.assertNotIn("oolong-7731", self._chat_input())

    @override_settings(MEMORY_COLD_STORAGE_ENABLED=True, MEMORY_COLD_STORAGE_KEY=TEST_AES_KEY)
    def test_delete_removes_the_archive_blob(self):
        s3 = FakeS3Client()
        tier_3.reset_cold_storage()
        self.addCleanup(tier_3.reset_cold_storage)
        with patch("memory.tier_3.boto3.client", return_value=s3):
            archived_id = self._client(self.alice).post(
                "/api/memory/save/", {"content": "Synthetic archived note ember-2210", "importance": 0.1}, format="json"
            ).json()["node_id"]
            self.assertEqual(len(s3.objects), 1)

            self.assertEqual(self._delete(self.alice, archived_id).status_code, 204)

        self.assertEqual(s3.objects, {})

    def test_other_users_cannot_delete_or_exclude(self):
        self.assertEqual(self._delete(self.bob).status_code, 404)
        response = self._client(self.bob).patch(
            f"/api/memory/nodes/{self.node_id}/", {"is_excluded": True}, format="json"
        )

        self.assertEqual(response.status_code, 404)
        node = MemoryNode.objects.get(id=self.node_id)
        self.assertFalse(node.is_excluded)
        self.assertIn(self.node_id, tier_2.get_collection().get()["ids"])

    def test_delete_requires_authentication(self):
        response = APIClient().delete(f"/api/memory/nodes/{self.node_id}/")

        self.assertEqual(response.status_code, 401)
        self.assertTrue(MemoryNode.objects.filter(id=self.node_id).exists())


@override_settings(
    MEMORY_AUTO_CAPTURE=False,
    MEMORY_COLD_STORAGE_ENABLED=True,
    MEMORY_COLD_STORAGE_KEY=TEST_AES_KEY,
    # Fast hasher for synthetic test passwords (production PBKDF2 costs ~0.8 s per hash)
    PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"],
)
class AccountDeletionMemoryCleanupTestCase(IsolatedVectorStoreMixin, TestCase):
    """T12 / ACC-06: deleting an account purges that owner's memory everywhere, and only theirs."""

    PASSWORD = "synthetic-pass-4410"

    def setUp(self):
        from django.contrib.auth.hashers import make_password

        super().setUp()
        self.alice = User.objects.create(
            username="Alice", email="alice@example.test", password_hash=make_password(self.PASSWORD)
        )
        self.bob = User.objects.create(
            username="Bob", email="bob@example.test", password_hash=make_password(self.PASSWORD)
        )
        self.alice_id, self.bob_id = str(self.alice.id), str(self.bob.id)
        self.s3 = FakeS3Client()
        tier_3.reset_cold_storage()
        self.addCleanup(tier_3.reset_cold_storage)
        self.mongo = MagicMock()
        for target, value in (
            ("memory.tier_3.boto3.client", MagicMock(return_value=self.s3)),
            ("memory.views.mongo_db", self.mongo),
            ("memory.services.mongo_db", self.mongo),
        ):
            patcher = patch(target, value)
            patcher.start()
            self.addCleanup(patcher.stop)

        self.alice_nodes = self._seed(self.alice, "oolong-7731")
        self.bob_nodes = self._seed(self.bob, "matcha-5512")

    def _client(self, user):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {make_access_token(str(user.id))}")
        return client

    def _seed(self, user, marker):
        client = self._client(user)
        indexed = client.post(
            "/api/memory/save/", {"content": f"Synthetic favourite tea is {marker}", "importance": 0.9}, format="json"
        ).json()["node_id"]
        archived = client.post(
            "/api/memory/save/", {"content": f"Synthetic archived note {marker}", "importance": 0.1}, format="json"
        ).json()["node_id"]
        return indexed, archived

    def _vault_key(self, node_id):
        return MemoryNode.objects.get(id=node_id).metadata["vault_uri"].split("/", 3)[3]

    def _delete_account(self, user, password):
        with self.captureOnCommitCallbacks(execute=True):
            return self._client(user).post("/api/profile/delete/", {"password": password}, format="json")

    def test_account_deletion_purges_only_that_owners_memory(self):
        alice_key = self._vault_key(self.alice_nodes[1])
        bob_key = self._vault_key(self.bob_nodes[1])

        response = self._delete_account(self.alice, self.PASSWORD)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(id=self.alice.id).exists())
        self.assertFalse(MemoryNode.objects.filter(owner_id=self.alice_id).exists())
        self.assertEqual(tier_2.get_collection().get(where={"o_id": self.alice_id})["ids"], [])
        self.assertNotIn(("flobrain-cold-vault", alice_key), self.s3.objects)
        self.mongo.workflow_events.delete_many.assert_called_once_with(
            {"user_id": self.alice_id, "event_type": {"$regex": "^memory_"}}
        )
        # Bob is untouched
        self.assertEqual(MemoryNode.objects.filter(owner_id=self.bob_id).count(), 2)
        self.assertEqual(tier_2.get_collection().get(where={"o_id": self.bob_id})["ids"], [self.bob_nodes[0]])
        self.assertIn(("flobrain-cold-vault", bob_key), self.s3.objects)

    def test_wrong_password_deletes_nothing(self):
        response = self._delete_account(self.alice, "not-the-password")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(MemoryNode.objects.filter(owner_id=self.alice_id).count(), 2)
        self.assertEqual(tier_2.get_collection().get(where={"o_id": self.alice_id})["ids"], [self.alice_nodes[0]])
        self.mongo.workflow_events.delete_many.assert_not_called()

    def test_derived_cleanup_failure_cannot_resurrect_memory(self):
        with patch("memory.services.delete_vectors", return_value=False), \
                patch("memory.services.delete_from_cold_storage", return_value=False):
            response = self._delete_account(self.alice, self.PASSWORD)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(MemoryNode.objects.filter(owner_id=self.alice_id).exists())
        # Orphan vectors may remain for reconciliation (T13), but recall re-joins SQL (I2)
        self.assertEqual(tier_2.retrieve_memories(self.alice_id, "favourite tea"), [])

    def test_memory_events_store_the_user_id_as_a_string(self):
        self._client(self.alice).patch(
            f"/api/memory/nodes/{self.alice_nodes[0]}/", {"is_excluded": True}, format="json"
        )

        event = self.mongo.workflow_events.insert_one.call_args.args[0]
        self.assertEqual(event["user_id"], self.alice_id)
        self.assertIsInstance(event["user_id"], str)


@override_settings(MEMORY_MIN_RELEVANCE=0.2, MEMORY_AUTO_CAPTURE=False, MEMORY_RECALL_ENABLED=True)
class MemoryReconcileTestCase(IsolatedVectorStoreMixin, TestCase):
    """T13: `memory_reconcile` (ACC-05 sweep, ACC-07 restart, ACC-08 row 1, ACC-10 d)."""

    FACT = "Synthetic favourite tea is oolong-7731"

    def setUp(self):
        super().setUp()
        self.alice = User.objects.create(username="Alice", email="alice@example.test", password_hash="unused")
        self.alice_id = str(self.alice.id)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {make_access_token(self.alice_id)}")
        mongo = patch("memory.views.mongo_db")
        mongo.start()
        self.addCleanup(mongo.stop)

    def _save(self, content, **extra):
        response = self.client.post("/api/memory/save/", {"content": content, **extra}, format="json")
        self.assertEqual(response.status_code, 200)
        return response.json()

    def _reconcile(self, *args):
        out = io.StringIO()
        call_command("memory_reconcile", *args, stdout=out)
        return json.loads(out.getvalue().strip().splitlines()[-1])

    def _simulate_restart(self):
        from chromadb.api.client import SharedSystemClient

        tier_2.reset_vector_store()
        SharedSystemClient.clear_system_cache()

    def _recall_ids(self, query="favourite tea"):
        return [node_id for node_id, _c, _s in tier_2.retrieve_memories(self.alice_id, query)]

    def test_memory_survives_a_process_restart(self):
        node_id = self._save(self.FACT)["node_id"]

        self._simulate_restart()

        self.assertEqual(self._recall_ids(), [node_id])
        self.assertIn(node_id, tier_2.get_collection().get()["ids"])

    def test_failed_index_is_repaired_once_the_embedder_recovers(self):
        with override_settings(
            MEMORY_EMBEDDING_FUNCTION="memory.testing.FailingEmbeddingFunction",
            MEMORY_VECTOR_COLLECTION="test_memory_failing",
        ):
            tier_2.reset_vector_store()
            with self.assertLogs("memory.tier_2", level="ERROR"):
                saved = self._save(self.FACT)
        tier_2.reset_vector_store()
        self.assertEqual(saved["index_status"], "failed")

        counts = self._reconcile()

        self.assertEqual(counts["reindexed"], 1)
        self.assertEqual(MemoryNode.objects.get(id=saved["node_id"]).index_status, MemoryNode.INDEX_INDEXED)
        self.assertEqual(self._recall_ids(), [saved["node_id"]])

    def test_orphan_vector_from_a_failed_delete_is_swept_and_stays_gone_after_restart(self):
        node_id = self._save(self.FACT)["node_id"]
        with patch("memory.views.delete_vectors", return_value=False), self.captureOnCommitCallbacks(execute=True):
            self.assertEqual(self.client.delete(f"/api/memory/nodes/{node_id}/").status_code, 204)
        self.assertIn(node_id, tier_2.get_collection().get()["ids"])

        counts = self._reconcile()
        self._simulate_restart()

        self.assertEqual(counts["orphan_vectors_deleted"], 1)
        self.assertNotIn(node_id, tier_2.get_collection().get()["ids"])
        self.assertEqual(self._recall_ids(), [])

    def test_stale_vector_metadata_is_resynced(self):
        node_id = self._save(self.FACT)["node_id"]
        self.client.patch(f"/api/memory/nodes/{node_id}/", {"memory_type": "summary"}, format="json")

        counts = self._reconcile()

        self.assertEqual(counts["resynced"], 1)
        metadata = tier_2.get_collection().get(ids=[node_id], include=["metadatas"])["metadatas"][0]
        self.assertEqual(metadata, {"o_id": self.alice_id, "memory_type": "summary"})

    def test_dry_run_reports_without_changing_anything(self):
        node_id = self._save(self.FACT)["node_id"]
        MemoryNode.objects.filter(id=node_id).update(index_status=MemoryNode.INDEX_FAILED)
        tier_2.get_collection().upsert(
            ids=["node-orphan"], documents=["Synthetic orphan"], metadatas=[{"o_id": self.alice_id, "memory_type": "chunk"}]
        )

        counts = self._reconcile("--dry-run")

        self.assertEqual((counts["reindexed"], counts["orphan_vectors_deleted"]), (1, 1))
        self.assertTrue(counts["dry_run"])
        self.assertEqual(MemoryNode.objects.get(id=node_id).index_status, MemoryNode.INDEX_FAILED)
        self.assertIn("node-orphan", tier_2.get_collection().get()["ids"])

    def test_second_run_changes_nothing(self):
        node_id = self._save(self.FACT)["node_id"]
        MemoryNode.objects.filter(id=node_id).update(index_status=MemoryNode.INDEX_PENDING)
        tier_2.get_collection().upsert(
            ids=["node-orphan"], documents=["Synthetic orphan"], metadatas=[{"o_id": self.alice_id, "memory_type": "chunk"}]
        )

        first = self._reconcile()
        second = self._reconcile()

        self.assertEqual((first["reindexed"], first["orphan_vectors_deleted"]), (1, 1))
        self.assertEqual(
            {k: v for k, v in second.items() if k not in ("dry_run", "archive")},
            {"reindexed": 0, "reindex_failed": 0, "resynced": 0, "orphan_vectors_deleted": 0,
             "orphan_archive_objects_deleted": 0},
        )

    @override_settings(MEMORY_COLD_STORAGE_ENABLED=True, MEMORY_COLD_STORAGE_KEY=TEST_AES_KEY)
    def test_archive_sweep_deletes_only_unreferenced_objects(self):
        s3 = FakeS3Client()
        tier_3.reset_cold_storage()
        self.addCleanup(tier_3.reset_cold_storage)
        with patch("memory.tier_3.boto3.client", return_value=s3):
            kept = [self._save(f"Synthetic archived note {i}", importance=0.1)["node_id"] for i in range(3)]
            gone = self._save("Synthetic archived note to delete", importance=0.1)["node_id"]
            gone_key = MemoryNode.objects.get(id=gone).metadata["vault_uri"].split("/", 3)[3]
            MemoryNode.objects.filter(id=gone).delete()  # row removed, blob left behind
            s3.objects[("flobrain-cold-vault", "archive/node_stale_copy.zst.enc")] = b"stale"

            without_flag = self._reconcile()
            counts = self._reconcile("--archive")
            again = self._reconcile("--archive")

        self.assertEqual(without_flag["orphan_archive_objects_deleted"], 0)
        self.assertEqual(counts["orphan_archive_objects_deleted"], 2)
        self.assertEqual(again["orphan_archive_objects_deleted"], 0)
        self.assertNotIn(("flobrain-cold-vault", gone_key), s3.objects)
        for node_id in kept:
            key = MemoryNode.objects.get(id=node_id).metadata["vault_uri"].split("/", 3)[3]
            self.assertIn(("flobrain-cold-vault", key), s3.objects)
