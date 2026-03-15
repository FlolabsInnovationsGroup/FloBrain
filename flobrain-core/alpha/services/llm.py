from __future__ import annotations

import json
import logging
from collections.abc import AsyncGenerator
from typing import Any

import httpx

from config.settings import settings

logger = logging.getLogger(__name__)


class LLMError(Exception):
    """Raised when all LLM backends fail."""
    pass


class LLMService:
    """
    LLM service that tries Ollama first, then falls back to an
    OpenAI-compatible API if configured.
    """

    def __init__(self) -> None:
        self.ollama_base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.ollama_model = settings.OLLAMA_MODEL
        self.openai_url = settings.OPENAI_COMPATIBLE_API_URL
        self.openai_key = settings.OPENAI_COMPATIBLE_API_KEY

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    async def chat(
        self,
        messages: list[dict[str, str]],
        stream: bool = False,
        model: str | None = None,
        **kwargs: Any,
    ) -> str | AsyncGenerator[str, None]:
        """
        Send a chat request.

        Returns a plain string when stream=False.
        Returns an AsyncGenerator[str] of text chunks when stream=True.
        """
        if stream:
            return self._stream(messages, model=model, **kwargs)
        return await self._complete(messages, model=model, **kwargs)

    async def health_check(self) -> dict[str, Any]:
        """Check whether Ollama is reachable."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.ollama_base_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    return {"available": True, "models": models}
                return {"available": False, "error": f"HTTP {resp.status_code}"}
        except Exception as exc:
            return {"available": False, "error": str(exc)}

    # ------------------------------------------------------------------
    # Ollama
    # ------------------------------------------------------------------

    async def _ollama_chat(
        self,
        messages: list[dict[str, str]],
        model: str | None = None,
        stream: bool = False,
        **kwargs: Any,
    ) -> str | AsyncGenerator[str, None]:
        chosen_model = model or self.ollama_model
        url = f"{self.ollama_base_url}/api/chat"
        payload: dict[str, Any] = {
            "model": chosen_model,
            "messages": messages,
            "stream": stream,
        }
        payload.update(kwargs)

        if stream:
            return self._ollama_stream(url, payload)

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["message"]["content"]

    async def _ollama_stream(
        self, url: str, payload: dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    content = chunk.get("message", {}).get("content", "")
                    if content:
                        yield content
                    if chunk.get("done"):
                        break

    # ------------------------------------------------------------------
    # OpenAI-compatible fallback
    # ------------------------------------------------------------------

    async def _openai_chat(
        self,
        messages: list[dict[str, str]],
        stream: bool = False,
        **kwargs: Any,
    ) -> str | AsyncGenerator[str, None]:
        if not self.openai_url or not self.openai_key:
            raise LLMError("OpenAI-compatible API not configured.")

        url = f"{self.openai_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json",
        }
        payload: dict[str, Any] = {
            "model": kwargs.pop("model", "gpt-3.5-turbo"),
            "messages": messages,
            "stream": stream,
        }
        payload.update(kwargs)

        if stream:
            return self._openai_stream(url, headers, payload)

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def _openai_stream(
        self, url: str, headers: dict, payload: dict
    ) -> AsyncGenerator[str, None]:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, headers=headers, json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    data_str = line[6:]
                    if data_str.strip() == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data_str)
                    except json.JSONDecodeError:
                        continue
                    delta = chunk["choices"][0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        yield content

    # ------------------------------------------------------------------
    # Internal routing
    # ------------------------------------------------------------------

    async def _complete(
        self, messages: list[dict[str, str]], model: str | None = None, **kwargs: Any
    ) -> str:
        # Try Ollama first
        try:
            result = await self._ollama_chat(messages, model=model, stream=False, **kwargs)
            assert isinstance(result, str)
            return result
        except Exception as ollama_err:
            logger.warning("Ollama failed: %s", ollama_err)

        # Try OpenAI-compatible fallback
        if self.openai_url and self.openai_key:
            try:
                result = await self._openai_chat(messages, stream=False, **kwargs)
                assert isinstance(result, str)
                return result
            except Exception as openai_err:
                logger.error("OpenAI-compatible API also failed: %s", openai_err)

        raise LLMError(
            "All LLM backends are unavailable. "
            "Ensure Ollama is running or configure OPENAI_COMPATIBLE_API_URL / KEY."
        )

    async def _stream(
        self, messages: list[dict[str, str]], model: str | None = None, **kwargs: Any
    ) -> AsyncGenerator[str, None]:
        """Return an async generator that streams text chunks."""
        # Try Ollama first
        try:
            gen = await self._ollama_chat(messages, model=model, stream=True, **kwargs)
            async for chunk in gen:  # type: ignore[union-attr]
                yield chunk
            return
        except Exception as ollama_err:
            logger.warning("Ollama streaming failed: %s", ollama_err)

        # Try OpenAI-compatible fallback
        if self.openai_url and self.openai_key:
            try:
                gen = await self._openai_chat(messages, stream=True, **kwargs)
                async for chunk in gen:  # type: ignore[union-attr]
                    yield chunk
                return
            except Exception as openai_err:
                logger.error("OpenAI-compatible streaming also failed: %s", openai_err)

        raise LLMError("All LLM backends are unavailable for streaming.")


# Module-level singleton
llm_service = LLMService()
