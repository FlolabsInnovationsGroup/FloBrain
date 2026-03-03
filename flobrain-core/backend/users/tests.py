from django.test import TestCase
from rest_framework.test import APIClient

from .jwt_utils import make_access_token
from .models import User


class ProfileAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username="Jane Doe",
            email="jane@example.com",
            password_hash="unused",
        )
        self.token = make_access_token(str(self.user.id))

    def test_get_profile_requires_auth(self):
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 401)

    def test_get_profile_returns_user_data(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], "jane@example.com")
        self.assertEqual(data["fullName"], "Jane Doe")
        self.assertEqual(data["id"], str(self.user.id))

    def test_patch_profile_requires_auth(self):
        response = self.client.patch(
            "/api/profile/",
            {"fullName": "Jane Smith", "email": "jane@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_patch_profile_updates_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.patch(
            "/api/profile/",
            {"fullName": "Jane Smith", "email": "jane.new@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["fullName"], "Jane Smith")
        self.assertEqual(data["email"], "jane.new@example.com")
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "Jane Smith")
        self.assertEqual(self.user.email, "jane.new@example.com")
