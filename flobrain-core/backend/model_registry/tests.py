from django.test import TestCase
from rest_framework.test import APIClient

from users.jwt_utils import make_access_token
from users.models import Role, User, UserRole

from .models import AIModel


def grant_role(user, role_name):
    """Test helper: assign `role_name` to `user` via the real UserRole join
    table (the only mechanism that exists - there is no role-assignment API).
    get_or_create on Role mirrors users/migrations/0002_create_admin_role.py,
    so this works whether or not that migration has already seeded the row.
    """
    role, _ = Role.objects.get_or_create(name=role_name)
    UserRole.objects.get_or_create(user=user, role=role)
    return role


class ModelRegistryAPITestCase(TestCase):
    list_url = "/api/model-registry/"
    names_url = "/api/model-registry/names/"

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username="Registry Manager",
            email="registry@example.com",
            password_hash="not-used",
        )
        # These tests exercise CRUD/validation behaviour, not the admin-role
        # gate itself (see ModelRegistryPermissionsTestCase below for that),
        # so the shared test user is granted the admin role it now needs to
        # reach POST/PATCH/DELETE.
        grant_role(self.user, "admin")
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {make_access_token(str(self.user.id))}"
        )
        self.payload = {
            "name": "GPT-4o",
            "provider_name": "OpenAI",
            "provider_type": "private",
            "supported_input_types": ["text", "image", "text"],
            "capabilities": ["chat", "coding", "Chat"],
        }

    def test_authentication_is_required(self):
        self.client.credentials()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["error"], "Authentication required")

    def test_create_and_read_registered_model(self):
        create_response = self.client.post(self.list_url, self.payload, format="json")

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(create_response.data["name"], "GPT-4o")
        self.assertEqual(
            create_response.data["supported_input_types"], ["text", "image"]
        )
        self.assertEqual(create_response.data["capabilities"], ["chat", "coding"])

        model_id = create_response.data["id"]
        detail_response = self.client.get(f"{self.list_url}{model_id}/")
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.data["provider_name"], "OpenAI")

        list_response = self.client.get(self.list_url)
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)

    def test_empty_registry_returns_empty_list(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_model_names_requires_valid_authentication(self):
        for token in (None, "invalid-token"):
            with self.subTest(token=token):
                self.client.credentials()
                if token:
                    self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
                response = self.client.get(self.names_url)
                self.assertEqual(response.status_code, 401)
                self.assertEqual(response.data["error"], "Authentication required")

    def test_model_names_returns_empty_list(self):
        response = self.client.get(self.names_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_model_names_returns_only_names_sorted_and_reflects_changes(self):
        whisper = AIModel.objects.create(
            name="Whisper",
            provider_name="OpenAI",
            provider_type="open-source",
            supported_input_types=["audio"],
            capabilities=["transcription"],
        )
        for provider in ("Provider A", "Provider B"):
            AIModel.objects.create(
                name="Llama",
                provider_name=provider,
                provider_type="open-source",
                supported_input_types=["text"],
                capabilities=["chat"],
            )

        response = self.client.get(self.names_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), ["Llama", "Llama", "Whisper"])

        whisper.name = "Audio model"
        whisper.save(update_fields=["name"])
        self.assertEqual(
            self.client.get(self.names_url).json(), ["Audio model", "Llama", "Llama"]
        )
        whisper.delete()
        self.assertEqual(self.client.get(self.names_url).json(), ["Llama", "Llama"])

    def test_model_names_does_not_accept_writes(self):
        for method in ("post", "put", "patch", "delete"):
            with self.subTest(method=method):
                response = getattr(self.client, method)(
                    self.names_url, self.payload, format="json"
                )
                self.assertEqual(response.status_code, 405)
        self.assertEqual(AIModel.objects.count(), 0)

    def test_update_registered_model(self):
        model = AIModel.objects.create(
            name="Whisper",
            provider_name="OpenAI",
            provider_type="private",
            supported_input_types=["audio"],
            capabilities=["transcription"],
        )

        response = self.client.patch(
            f"{self.list_url}{model.pk}/",
            {"capabilities": ["transcription", "translation"]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["capabilities"], ["transcription", "translation"]
        )
        model.refresh_from_db()
        self.assertEqual(model.capabilities, ["transcription", "translation"])

    def test_delete_registered_model(self):
        model = AIModel.objects.create(
            name="Llama 3",
            provider_name="Meta",
            provider_type="open-source",
            supported_input_types=["text"],
            capabilities=["chat"],
        )

        response = self.client.delete(f"{self.list_url}{model.pk}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(AIModel.objects.filter(pk=model.pk).exists())

    def test_rejects_invalid_provider_and_input_type(self):
        payload = {
            **self.payload,
            "provider_type": "hosted",
            "supported_input_types": ["spreadsheet"],
        }
        response = self.client.post(self.list_url, payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Validation failed")
        self.assertIn("provider_type", response.data["details"])
        self.assertIn("supported_input_types", response.data["details"])

    def test_rejects_multimodal_as_an_input_type(self):
        payload = {
            **self.payload,
            "supported_input_types": ["multimodal"],
        }

        response = self.client.post(self.list_url, payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Validation failed")
        self.assertIn("supported_input_types", response.data["details"])

    def test_rejects_empty_input_types_and_capabilities(self):
        payload = {
            **self.payload,
            "supported_input_types": [],
            "capabilities": [],
        }
        response = self.client.post(self.list_url, payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("supported_input_types", response.data["details"])
        self.assertIn("capabilities", response.data["details"])

    def test_rejects_duplicate_provider_and_model_case_insensitively(self):
        AIModel.objects.create(
            name="gpt-4O",
            provider_name="openai",
            provider_type="private",
            supported_input_types=["text"],
            capabilities=["chat"],
        )

        response = self.client.post(self.list_url, self.payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("name", response.data["details"])

    def test_missing_model_returns_not_found(self):
        response = self.client.get(f"{self.list_url}99999/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Not found")


class ModelRegistryPermissionsTestCase(TestCase):
    """Role-gating for Model Registry writes (confirmed requirements):

    - Unauthenticated -> 401 on every endpoint, including GET.
    - Any authenticated user (admin or not) -> 200 on GET (list, detail,
      names) - no role check on reads.
    - Only users with the "admin" role (via UserRole) -> allowed to
      POST/PATCH/DELETE; everyone else authenticated -> 403.

    Uses users.permissions.IsAdmin via model_registry/views.py's
    get_permissions() overrides; roles are granted through the real
    UserRole table, the same way Django Admin would do it - there is no
    role-assignment API.
    """

    list_url = "/api/model-registry/"
    names_url = "/api/model-registry/names/"

    def setUp(self):
        self.client = APIClient()
        self.regular_user = User.objects.create(
            username="Regular", email="regular@example.com", password_hash="not-used"
        )
        self.admin_user = User.objects.create(
            username="Admin", email="admin@example.com", password_hash="not-used"
        )
        grant_role(self.admin_user, "admin")

        self.regular_token = make_access_token(str(self.regular_user.id))
        self.admin_token = make_access_token(str(self.admin_user.id))

        self.model = AIModel.objects.create(
            name="Claude",
            provider_name="Anthropic",
            provider_type="private",
            supported_input_types=["text"],
            capabilities=["chat"],
        )
        self.create_payload = {
            "name": "GPT-4o",
            "provider_name": "OpenAI",
            "provider_type": "private",
            "supported_input_types": ["text"],
            "capabilities": ["chat"],
        }

    def auth_as(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    # ---------- GET: no role check, any authenticated user ----------

    def test_get_list_without_token_returns_401(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 401)

    def test_get_list_with_regular_user_returns_200(self):
        self.auth_as(self.regular_token)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 200)

    def test_get_list_with_admin_user_returns_200(self):
        self.auth_as(self.admin_token)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 200)

    def test_get_names_without_token_returns_401(self):
        response = self.client.get(self.names_url)
        self.assertEqual(response.status_code, 401)

    def test_get_names_with_regular_user_returns_200(self):
        self.auth_as(self.regular_token)
        response = self.client.get(self.names_url)
        self.assertEqual(response.status_code, 200)

    def test_get_names_with_admin_user_returns_200(self):
        self.auth_as(self.admin_token)
        response = self.client.get(self.names_url)
        self.assertEqual(response.status_code, 200)

    def test_get_detail_without_token_returns_401(self):
        response = self.client.get(f"{self.list_url}{self.model.pk}/")
        self.assertEqual(response.status_code, 401)

    def test_get_detail_with_regular_user_returns_200(self):
        self.auth_as(self.regular_token)
        response = self.client.get(f"{self.list_url}{self.model.pk}/")
        self.assertEqual(response.status_code, 200)

    # ---------- POST: admin role required ----------

    def test_post_without_token_returns_401(self):
        response = self.client.post(self.list_url, self.create_payload, format="json")
        self.assertEqual(response.status_code, 401)
        self.assertFalse(AIModel.objects.filter(name="GPT-4o").exists())

    def test_post_with_regular_user_returns_403(self):
        self.auth_as(self.regular_token)
        response = self.client.post(self.list_url, self.create_payload, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertFalse(AIModel.objects.filter(name="GPT-4o").exists())

    def test_post_with_admin_user_succeeds(self):
        self.auth_as(self.admin_token)
        response = self.client.post(self.list_url, self.create_payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(AIModel.objects.filter(name="GPT-4o").exists())

    # ---------- PATCH: admin role required (this view has no PUT) ----------

    def test_patch_without_token_returns_401(self):
        response = self.client.patch(
            f"{self.list_url}{self.model.pk}/", {"capabilities": ["vision"]}, format="json"
        )
        self.assertEqual(response.status_code, 401)

    def test_patch_with_regular_user_returns_403(self):
        self.auth_as(self.regular_token)
        response = self.client.patch(
            f"{self.list_url}{self.model.pk}/", {"capabilities": ["vision"]}, format="json"
        )
        self.assertEqual(response.status_code, 403)
        self.model.refresh_from_db()
        self.assertEqual(self.model.capabilities, ["chat"])

    def test_patch_with_admin_user_succeeds(self):
        self.auth_as(self.admin_token)
        response = self.client.patch(
            f"{self.list_url}{self.model.pk}/", {"capabilities": ["vision"]}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.model.refresh_from_db()
        self.assertEqual(self.model.capabilities, ["vision"])

    # ---------- DELETE: admin role required ----------

    def test_delete_without_token_returns_401(self):
        response = self.client.delete(f"{self.list_url}{self.model.pk}/")
        self.assertEqual(response.status_code, 401)
        self.assertTrue(AIModel.objects.filter(pk=self.model.pk).exists())

    def test_delete_with_regular_user_returns_403(self):
        self.auth_as(self.regular_token)
        response = self.client.delete(f"{self.list_url}{self.model.pk}/")
        self.assertEqual(response.status_code, 403)
        self.assertTrue(AIModel.objects.filter(pk=self.model.pk).exists())

    def test_delete_with_admin_user_succeeds(self):
        self.auth_as(self.admin_token)
        response = self.client.delete(f"{self.list_url}{self.model.pk}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(AIModel.objects.filter(pk=self.model.pk).exists())

    # ---------- a role other than "admin" must not grant write access ----------

    def test_user_with_unrelated_role_still_gets_403_on_write(self):
        other_role_user = User.objects.create(
            username="Has Other Role", email="other-role@example.com", password_hash="unused"
        )
        grant_role(other_role_user, "support")
        self.auth_as(make_access_token(str(other_role_user.id)))
        response = self.client.post(self.list_url, self.create_payload, format="json")
        self.assertEqual(response.status_code, 403)
