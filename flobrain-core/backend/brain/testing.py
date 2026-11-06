"""Shared helpers that keep chat tests away from the real multimodal service."""

import email.parser
import email.policy
import json
from contextlib import contextmanager
from unittest.mock import MagicMock, patch


def _parse_multipart(body: bytes, content_type: str) -> dict[str, str]:
    message = email.parser.BytesParser(policy=email.policy.HTTP).parsebytes(
        f"Content-Type: {content_type}\r\n\r\n".encode("utf-8") + body
    )
    return {
        part.get_param("name", header="content-disposition"): part.get_content()
        for part in message.iter_parts()
    }


@contextmanager
def capture_multimodal_requests(result: str = "Synthetic assistant reply."):
    """Patch the adapter's urlopen and record the form fields of each request.

    Yields a list that receives one dict per call, e.g. {"text_input": "..."}.
    """
    captured: list[dict[str, str]] = []

    def fake_urlopen(req, timeout=None):
        captured.append(_parse_multipart(req.data, req.get_header("Content-type")))
        response = MagicMock()
        response.read.return_value = json.dumps(
            {"result": result, "model": "fake-model", "file_type": "text", "total_tokens": 0}
        ).encode("utf-8")
        response.__enter__.return_value = response
        return response

    with patch("brain.llm.multimodal_adapter.urllib.request.urlopen", side_effect=fake_urlopen):
        yield captured
