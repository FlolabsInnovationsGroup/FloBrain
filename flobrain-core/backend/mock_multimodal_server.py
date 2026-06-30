import json
from http.server import BaseHTTPRequestHandler, HTTPServer


class MockMultimodalHandler(BaseHTTPRequestHandler):
    def _send_json(self, body, status=200):
        data = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path != "/api/v1/chat/":
            self._send_json({"error": "Not found"}, status=404)
            return

        length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        messages = payload.get("messages", [])
        model = payload.get("model", "gpt-3.5-turbo")

        last_user = next((msg.get("content", "") for msg in reversed(messages) if msg.get("role") == "user"), "")
        response_text = (
            f'I received your message: "{last_user[:120]}". '
            "This is a placeholder response from the mock multimodal service."
        )
        prompt_tokens = 10 + len(last_user.split())
        completion_tokens = 12 + len(response_text.split())
        total_tokens = prompt_tokens + completion_tokens

        result = {
            "response_text": response_text,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "model": model,
            "provider": "mock",
            "usage": {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
            },
            "estimated": True,
        }
        self._send_json(result)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8001), MockMultimodalHandler)
    print("Mock multimodal server running on http://0.0.0.0:8001")
    server.serve_forever()
