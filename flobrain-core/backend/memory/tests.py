from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from users.jwt_utils import make_access_token
from users.models import User

from .models import MemoryLink, MemoryNode


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
            name="Primary memory",
            memory_type="summary",
            relevance=0.75,
        )
        self.related_node = MemoryNode.objects.create(
            id="node-related",
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
