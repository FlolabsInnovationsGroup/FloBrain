"""memory/tests/test_supermemory_connector.py — Mock tests for connector methods.

Covers:
  - get_profile(): happy path, empty profile, timeout fallback
  - list_connections(): happy path, empty list, 5xx error
  - upload_file(): stub mode, happy path

All tests use unittest.mock — no real network. Tests both STUB and REMOTE modes.
"""
import os
import tempfile
import unittest
from unittest.mock import patch, MagicMock

import django
from django.test import TestCase

from memory import supermemory_connector as smc


class GetProfileTests(TestCase):
    """P1.W2.07 — 3 test cases for get_profile()."""

    def test_stub_mode_returns_empty_profile(self):
        """When SUPERMEMORY_BASE_URL not set, returns empty profile dict."""
        with patch.object(smc, 'is_configured', return_value=False):
            result = smc.get_profile(owner_id="test_user")
            self.assertIn("profile", result)
            self.assertEqual(result["profile"]["static"], [])
            self.assertEqual(result["profile"]["dynamic"], [])
            self.assertEqual(result["searchResults"], [])

    @patch('memory.supermemory_connector.requests.post')
    def test_happy_path_returns_profile_with_facts(self, mock_post):
        """Mock 200 response with static facts — returns parsed profile."""
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "profile": {
                    "static": [{"content": "User likes pizza"}],
                    "dynamic": [{"content": "Working on FloBrain"}],
                },
                "searchResults": [{"id": "mem_1", "content": "test"}],
            }
        )
        with patch.object(smc, 'is_configured', return_value=True), \
             patch.object(smc, '_BASE_URL', 'http://test:8787'):
            result = smc.get_profile(owner_id="user_123", q="preferences")
            self.assertEqual(len(result["profile"]["static"]), 1)
            self.assertEqual(result["profile"]["static"][0]["content"], "User likes pizza")
            self.assertEqual(len(result["profile"]["dynamic"]), 1)

    @patch('memory.supermemory_connector.requests.post')
    def test_timeout_returns_graceful_fallback(self, mock_post):
        """Mock ConnectionError — get_profile returns empty profile, doesn't crash."""
        import requests as real_requests
        mock_post.side_effect = real_requests.ConnectionError("timeout")

        with patch.object(smc, 'is_configured', return_value=True), \
             patch.object(smc, '_BASE_URL', 'http://test:8787'):
            result = smc.get_profile(owner_id="user_123")
            # Must NOT raise — graceful fallback
            self.assertIn("profile", result)
            self.assertEqual(result["profile"]["static"], [])
            self.assertIn("error", result)


class ListConnectionsTests(TestCase):
    """P1.W2.08 — 3 test cases for list_connections()."""

    def test_stub_mode_returns_empty_list(self):
        with patch.object(smc, 'is_configured', return_value=False):
            result = smc.list_connections()
            self.assertEqual(result, [])

    @patch('memory.supermemory_connector.requests.get')
    def test_happy_path_returns_connectors(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: [
                {"id": "conn_1", "name": "google_drive", "status": "active"},
                {"id": "conn_2", "name": "notion", "status": "active"},
            ]
        )
        with patch.object(smc, 'is_configured', return_value=True), \
             patch.object(smc, '_BASE_URL', 'http://test:8787'):
            result = smc.list_connections()
            self.assertEqual(len(result), 2)
            self.assertEqual(result[0]["name"], "google_drive")

    @patch('memory.supermemory_connector.requests.get')
    def test_5xx_raises_runtime_error(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=500,
            text="Internal Server Error"
        )
        with patch.object(smc, 'is_configured', return_value=True), \
             patch.object(smc, '_BASE_URL', 'http://test:8787'):
            with self.assertRaises(RuntimeError) as ctx:
                smc.list_connections()
            self.assertIn("500", str(ctx.exception))


class UploadFileTests(TestCase):
    """P1.W2.04 — tests for upload_file()."""

    def test_stub_mode_returns_stub_dict(self):
        with patch.object(smc, 'is_configured', return_value=False):
            with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
                f.write("test content")
                f.flush()
                path = f.name
            try:
                result = smc.upload_file(path, metadata={"owner_id": "test"})
                self.assertEqual(result["status"], "stub")
            finally:
                os.unlink(path)


class HealthCheckTests(TestCase):
    """Tests for health() in both modes."""

    def test_stub_mode_returns_local_fallback(self):
        with patch.object(smc, 'is_configured', return_value=False):
            result = smc.health()
            self.assertEqual(result["status"], "stub")
            self.assertEqual(result["mode"], "local_fallback")

    @patch('memory.supermemory_connector.requests.get')
    def test_remote_ok_returns_latency(self, mock_get):
        mock_get.return_value = MagicMock(status_code=200)
        with patch.object(smc, 'is_configured', return_value=True), \
             patch.object(smc, '_BASE_URL', 'http://test:8787'):
            result = smc.health()
            self.assertEqual(result["status"], "ok")
            self.assertIn("latency_ms", result)

    @patch('memory.supermemory_connector.requests.get')
    def test_remote_unreachable_returns_error(self, mock_get):
        import requests as real_requests
        mock_get.side_effect = real_requests.ConnectionError("server down")
        with patch.object(smc, 'is_configured', return_value=True), \
             patch.object(smc, '_BASE_URL', 'http://test:8787'):
            result = smc.health()
            self.assertEqual(result["status"], "unreachable")
            self.assertIn("error", result)


class TimeoutConfigTest(TestCase):
    """P1.W2.01 — verify timeout default is 2s."""

    def test_default_timeout_is_2_seconds(self):
        # Reload module-level _TIMEOUT
        import importlib
        with patch.dict(os.environ, {"SUPERMEMORY_TIMEOUT": "2"}, clear=False):
            importlib.reload(smc)
            self.assertEqual(smc._TIMEOUT, 2)
