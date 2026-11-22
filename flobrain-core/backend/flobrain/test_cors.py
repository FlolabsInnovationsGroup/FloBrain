"""
CORS configuration tests.

Team-confirmed (backend security report): CORS_ALLOW_ALL_ORIGINS=False and the
only approved production origin is https://flobrain.ai. Localhost origins must
stay dev-only.

Two layers are tested:
1. The settings-computation logic in flobrain/settings.py itself (env var ->
   CORS_ALLOWED_ORIGINS, DEBUG-gated localhost), via the same
   importlib.reload-under-patched-environ technique memory/tests.py already
   uses for tier_2/tier_3.
2. The actual django-cors-headers middleware behaviour against a real request,
   via override_settings, so this doesn't just test "our list is right" but
   that the approved origin is genuinely allowed and an unapproved one is not.
"""
import importlib
import os
from unittest.mock import patch

from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework.test import APIClient

from flobrain import settings as flobrain_settings

APPROVED_ORIGIN = "https://flobrain.ai"
UNAPPROVED_ORIGIN = "https://evil.example.com"

# Any endpoint that doesn't require auth; CORS headers are added by middleware
# regardless of the view, so DashboardHealthView (public) is a convenient probe.
PUBLIC_URL = "/api/dashboard/health/"


class CorsSettingsComputationTestCase(SimpleTestCase):
    """Exercises the real env-var parsing / DEBUG-gating logic in settings.py."""

    def _reload_with_env(self, **env):
        base_env = {
            "SECRET_KEY": "test-only-not-a-real-secret-0123456789abcdef",
            "DB_ENGINE": "sqlite",
            "CORS_ALLOWED_ORIGINS": "",
        }
        base_env.update(env)
        with patch.dict(os.environ, base_env, clear=False):
            importlib.reload(flobrain_settings)
        return flobrain_settings

    def tearDown(self):
        # Leave the module holding the values the real test run configured it
        # with, so later tests in other modules aren't affected.
        importlib.reload(flobrain_settings)

    def test_wildcard_cors_is_disabled(self):
        self.assertFalse(flobrain_settings.CORS_ALLOW_ALL_ORIGINS)

    def test_production_mode_allows_only_the_confirmed_origin(self):
        mod = self._reload_with_env(DEBUG="False", CORS_ALLOWED_ORIGINS=APPROVED_ORIGIN)
        self.assertEqual(mod.CORS_ALLOWED_ORIGINS, [APPROVED_ORIGIN])

    def test_production_mode_without_env_var_allows_no_origins(self):
        mod = self._reload_with_env(DEBUG="False", CORS_ALLOWED_ORIGINS="")
        self.assertEqual(mod.CORS_ALLOWED_ORIGINS, [])

    def test_production_mode_never_includes_localhost(self):
        mod = self._reload_with_env(DEBUG="False", CORS_ALLOWED_ORIGINS=APPROVED_ORIGIN)
        self.assertNotIn("http://localhost:3000", mod.CORS_ALLOWED_ORIGINS)
        self.assertNotIn("http://127.0.0.1:3000", mod.CORS_ALLOWED_ORIGINS)

    def test_dev_mode_adds_localhost_alongside_the_confirmed_origin(self):
        mod = self._reload_with_env(DEBUG="True", CORS_ALLOWED_ORIGINS=APPROVED_ORIGIN)
        self.assertIn(APPROVED_ORIGIN, mod.CORS_ALLOWED_ORIGINS)
        self.assertIn("http://localhost:3000", mod.CORS_ALLOWED_ORIGINS)
        self.assertIn("http://127.0.0.1:3000", mod.CORS_ALLOWED_ORIGINS)

    def test_dev_mode_without_env_var_still_allows_localhost_only(self):
        mod = self._reload_with_env(DEBUG="True", CORS_ALLOWED_ORIGINS="")
        self.assertEqual(
            set(mod.CORS_ALLOWED_ORIGINS),
            {"http://localhost:3000", "http://127.0.0.1:3000"},
        )

    def test_unapproved_origin_is_never_added_automatically(self):
        # Only the env var and (in dev) the two hardcoded localhost origins can
        # ever appear - nothing else should be invented.
        mod = self._reload_with_env(DEBUG="False", CORS_ALLOWED_ORIGINS=APPROVED_ORIGIN)
        self.assertNotIn(UNAPPROVED_ORIGIN, mod.CORS_ALLOWED_ORIGINS)
        self.assertNotIn("https://www.flobrain.ai", mod.CORS_ALLOWED_ORIGINS)
        self.assertNotIn("https://staging.flobrain.ai", mod.CORS_ALLOWED_ORIGINS)


@override_settings(CORS_ALLOW_ALL_ORIGINS=False, CORS_ALLOWED_ORIGINS=[APPROVED_ORIGIN])
class CorsMiddlewareBehaviorTestCase(TestCase):
    """End-to-end: does django-cors-headers actually enforce this, not just our
    settings computation. Simulates the production configuration directly via
    override_settings (CORS_ALLOWED_ORIGINS is read per-request, so this is
    equivalent to that env var being set in a real deployment)."""

    def test_approved_origin_receives_allow_origin_header(self):
        client = APIClient()
        response = client.get(PUBLIC_URL, HTTP_ORIGIN=APPROVED_ORIGIN)
        self.assertEqual(response["Access-Control-Allow-Origin"], APPROVED_ORIGIN)

    def test_unapproved_origin_receives_no_allow_origin_header(self):
        client = APIClient()
        response = client.get(PUBLIC_URL, HTTP_ORIGIN=UNAPPROVED_ORIGIN)
        self.assertNotIn("Access-Control-Allow-Origin", response)

    def test_request_without_origin_header_still_succeeds(self):
        # Same-origin / non-browser clients (no Origin header) must not be
        # blocked by CORS - only cross-origin browser requests are affected.
        client = APIClient()
        response = client.get(PUBLIC_URL)
        self.assertEqual(response.status_code, 200)

    def test_preflight_for_approved_origin_is_allowed(self):
        client = APIClient()
        response = client.options(
            PUBLIC_URL,
            HTTP_ORIGIN=APPROVED_ORIGIN,
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET",
        )
        self.assertEqual(response["Access-Control-Allow-Origin"], APPROVED_ORIGIN)

    def test_preflight_for_unapproved_origin_is_rejected(self):
        client = APIClient()
        response = client.options(
            PUBLIC_URL,
            HTTP_ORIGIN=UNAPPROVED_ORIGIN,
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET",
        )
        self.assertNotIn("Access-Control-Allow-Origin", response)
