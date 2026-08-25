from django.test import TestCase
from rest_framework.test import APIClient

from users.jwt_utils import make_access_token
from users.models import User

from .models import AIModel


class ModelRegistryAPITestCase(TestCase):
    list_url = "/api/model-registry/"

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username="Registry Manager",
            email="registry@example.com",
            password_hash="not-used",
        )
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
