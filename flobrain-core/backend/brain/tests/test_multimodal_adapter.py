from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings

from brain.llm.multimodal_adapter import MultimodalLLMAdapter


class MultimodalAdapterTestCase(TestCase):
    @override_settings(
        MULTIMODAL_SERVICE_URL="http://multimodal.test",
        LLM_DEFAULT_MODEL="gpt-4o-mini",
    )
    @patch("brain.llm.multimodal_adapter.urllib.request.urlopen")
    def test_generate_parses_token_usage_from_multimodal_response(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.read.return_value = (
            b'{"response_text":"Hello from GPT","prompt_tokens":12,'
            b'"completion_tokens":8,"total_tokens":20,"model":"gpt-4o-mini","provider":"openai"}'
        )
        mock_response.__enter__ = lambda self: self
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        result = MultimodalLLMAdapter().generate(
            [{"role": "user", "content": "Hi"}],
            model="gpt-4o-mini",
        )

        self.assertEqual(result.text, "Hello from GPT")
        self.assertEqual(result.prompt_tokens, 12)
        self.assertEqual(result.completion_tokens, 8)
        self.assertEqual(result.total_tokens, 20)
        self.assertFalse(result.estimated)

    @override_settings(MULTIMODAL_SERVICE_URL="")
    def test_generate_falls_back_to_mock_when_url_missing(self):
        result = MultimodalLLMAdapter().generate(
            [{"role": "user", "content": "Hi"}],
        )
        self.assertIn("placeholder", result.text.lower())
