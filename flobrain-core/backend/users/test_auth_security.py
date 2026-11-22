"""
Security-focused tests for the shared `get_user_from_request` auth helper
(users/views.py) and the endpoints that depend on it directly.

This fills gaps identified in the backend security audit: the existing
users/tests.py only covered "missing token" and "valid token" for ProfileView.
It did not cover invalid tokens, expired tokens, malformed Authorization
headers, or write-endpoints (change password / delete account / preferences)
without auth, nor cross-user access to another user's preferences.

Follows the existing project convention: TestCase + rest_framework.test.APIClient
+ users.jwt_utils.make_access_token (see teams/test_views_list_create.py,
model_registry/tests.py).
"""
import time

import jwt
from django.conf import settings
from django.test import TestCase
from rest_framework.test import APIClient

from .jwt_utils import ALGORITHM, make_access_token, make_refresh_token
from .models import PresetPreferences, User, UserPreferences


def make_expired_access_token(user_id: str) -> str:
    """An access token that is already past its exp claim.

    Mirrors jwt_utils.make_access_token's payload shape exactly, except exp is
    in the past, so decode_token() -> jwt.decode() raises ExpiredSignatureError
    (a subclass of InvalidTokenError) and get_user_from_request returns None.
    """
    payload = {
        "sub": user_id,
        "type": "access",
        "exp": int(time.time()) - 10,
        "iat": int(time.time()) - 3700,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


class TokenValidationTestCase(TestCase):
    """Covers the token-validation branches of get_user_from_request, exercised
    through ProfileView (the simplest authenticated endpoint)."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username="Token Tester", email="token-tester@example.com", password_hash="unused"
        )

    def test_missing_authorization_header_returns_401(self):
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 401)

    def test_invalid_token_returns_401(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-token")
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 401)

    def test_expired_token_returns_401(self):
        expired = make_expired_access_token(str(self.user.id))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {expired}")
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 401)

    def test_refresh_token_rejected_as_access_token(self):
        # A syntactically valid, unexpired token of the wrong `type` must not
        # authenticate - only "access" tokens should.
        refresh = make_refresh_token(str(self.user.id))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh}")
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 401)

    def test_malformed_authorization_header_without_bearer_prefix_returns_401(self):
        token = make_access_token(str(self.user.id))
        self.client.credentials(HTTP_AUTHORIZATION=token)  # missing "Bearer " prefix
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 401)

    def test_token_for_deleted_user_returns_401(self):
        token = make_access_token(str(self.user.id))
        self.user.delete()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 401)

    def test_valid_token_returns_200(self):
        token = make_access_token(str(self.user.id))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 200)


class WriteEndpointsRequireAuthTestCase(TestCase):
    """Endpoints that mutate account state must all reject unauthenticated
    requests - not just read endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username="Write Tester", email="write-tester@example.com", password_hash="unused"
        )

    def test_change_password_requires_auth(self):
        response = self.client.post(
            "/api/profile/change-password/",
            {"current_password": "whatever", "new_password": "newpassword123"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_delete_account_requires_auth(self):
        response = self.client.post(
            "/api/profile/delete/", {"password": "whatever"}, format="json"
        )
        self.assertEqual(response.status_code, 401)
        self.assertTrue(User.objects.filter(id=self.user.id).exists())

    def test_preferences_list_requires_auth(self):
        response = self.client.get("/api/settings/preferences/")
        self.assertEqual(response.status_code, 401)

    def test_preferences_create_requires_auth(self):
        response = self.client.post(
            "/api/settings/preferences/", {"overrides": {}}, format="json"
        )
        self.assertEqual(response.status_code, 401)


class PreferencesOwnershipTestCase(TestCase):
    """UserPreferencesListCreateView scopes patch/delete by (id, user=user) -
    confirm a user genuinely cannot reach another user's preference row."""

    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create(
            username="Owner", email="owner@example.com", password_hash="unused"
        )
        self.other = User.objects.create(
            username="Other", email="other@example.com", password_hash="unused"
        )
        self.preference = UserPreferences.objects.create(
            user=self.owner, overrides={"theme": "dark"}
        )
        self.other_token = make_access_token(str(self.other.id))

    def auth_as_other(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_token}")

    def test_other_user_cannot_patch_someone_elses_preference(self):
        self.auth_as_other()
        response = self.client.patch(
            f"/api/settings/preferences/{self.preference.id}/",
            {"overrides": {"theme": "light"}},
            format="json",
        )
        self.assertEqual(response.status_code, 404)
        self.preference.refresh_from_db()
        self.assertEqual(self.preference.overrides, {"theme": "dark"})

    def test_other_user_cannot_delete_someone_elses_preference(self):
        self.auth_as_other()
        response = self.client.delete(f"/api/settings/preferences/{self.preference.id}/")
        self.assertEqual(response.status_code, 404)
        self.assertTrue(UserPreferences.objects.filter(id=self.preference.id).exists())


class PresetPreferencesPublicAccessTestCase(TestCase):
    """PresetPreferencesListView (users/views.py) has no auth check at all -
    documenting this current, intentional-looking behaviour explicitly rather
    than leaving it implicit. Flagged in the security report for confirmation
    that an unauthenticated, read-only preset catalog is the intended design.
    """

    def test_preset_list_is_publicly_readable(self):
        PresetPreferences.objects.create(name="Default", settings={})
        client = APIClient()
        response = client.get("/api/settings/presets/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
