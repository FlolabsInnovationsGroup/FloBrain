import os

from django.conf import settings

from .mock_adapter import MockLLMAdapter
from .multimodal_adapter import MultimodalLLMAdapter
from .openai_adapter import OpenAILLMAdapter


def get_llm_adapter():
    provider = getattr(settings, "LLM_PROVIDER", "") or os.environ.get("LLM_PROVIDER", "mock")
    provider = provider.lower().strip()

    if provider in ("multimodal", "cloud", "flobrain-cloud"):
        return MultimodalLLMAdapter()
    if provider == "openai":
        return OpenAILLMAdapter()
    return MockLLMAdapter()
