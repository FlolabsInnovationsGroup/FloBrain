# FloBrain Alpha — Setup & Run Guide

## Prerequisites

- Python 3.11+ (3.14 works; use `--prefer-binary` flag if packages fail to compile)
- pip
- (Optional) [Ollama](https://ollama.com) for local LLM inference
- (Optional) Docker + Docker Compose for containerised setup

---

## 1. Local Development Setup (Without Docker)

### 1.1 Clone & navigate

```bash
cd flobrain-core/alpha
```

### 1.2 Create a virtual environment

```bash
python -m venv .venv
# Linux / macOS
source .venv/bin/activate
# Windows
.venv\Scripts\activate
```

### 1.3 Install dependencies

```bash
pip install --prefer-binary -r requirements.txt
```

> `--prefer-binary` avoids compiling packages from source, which helps on Python 3.14 where some packages haven't published source-compatible releases yet.

### 1.4 Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:
- `NOTION_TOKEN` — your Notion integration token
- `JWT_SECRET_KEY` — a secure random string (32+ chars)

### 1.5 Start Ollama (optional but recommended)

```bash
# Install Ollama from https://ollama.com
ollama serve                    # Start the server
ollama pull llama3.2            # Pull the default model
```

If Ollama is not running, chat requests will return a graceful error message.

### 1.6 Run the server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

## 2. Docker Setup

### 2.1 Build and start

```bash
docker-compose up --build
```

This starts:
- `flobrain` — the FastAPI app on port 8000
- `ollama` — the local LLM server on port 11434

### 2.2 Pull a model into Ollama

```bash
docker exec -it flobrain-ollama ollama pull llama3.2
```

### 2.3 Stop

```bash
docker-compose down
```

Data is persisted in Docker volumes (`flobrain_data`, `ollama_models`).

---

## 3. Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `FloBrain` | Application name |
| `DEBUG` | `false` | Enable debug logging and auto-reload |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `8000` | HTTP port |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.2` | Model to use for inference |
| `OPENAI_COMPATIBLE_API_URL` | _(unset)_ | Optional fallback API URL |
| `OPENAI_COMPATIBLE_API_KEY` | _(unset)_ | API key for fallback |
| `NOTION_TOKEN` | _(unset)_ | Notion integration token |
| `NOTION_TASKS_DB_ID` | _(unset)_ | Notion Tasks database ID |
| `NOTION_PROJECTS_DB_ID` | _(unset)_ | Notion Projects database ID |
| `NOTION_CLIENT_ID` | _(unset)_ | For OAuth flow |
| `NOTION_CLIENT_SECRET` | _(unset)_ | For OAuth flow |
| `JWT_SECRET_KEY` | _(change this!)_ | Secret for signing JWTs |
| `JWT_EXPIRE_MINUTES` | `1440` | Token lifetime (24 hours) |
| `SQLITE_URL` | `sqlite+aiosqlite:///./data/flobrain.db` | Database URL |
| `CHROMADB_PATH` | `./data/chroma` | ChromaDB persistence directory |
| `CORS_ORIGINS` | `["http://localhost:3000",...]` | Allowed CORS origins (JSON array or comma-separated) |

---

## 4. API Endpoints Reference

### Health

```
GET /api/v1/health
```
Returns service status and version. No auth required.

---

### Auth

```
POST /api/v1/auth/register
Body: { "email": "...", "username": "...", "password": "..." }
Response: UserResponse
```

```
POST /api/v1/auth/login
Body: { "username": "...", "password": "..." }
Response: { "access_token": "...", "token_type": "bearer", "expires_in": 86400 }
```

```
GET /api/v1/auth/me
Headers: Authorization: Bearer <token>
Response: UserResponse
```

---

### Chat

```
POST /api/v1/chat
Body: { "message": "...", "session_id": "..." (optional), "stream": false }
Response: { "response": "...", "session_id": "...", "agent_used": "...", ... }
```

For streaming, set `"stream": true` — the response is Server-Sent Events:
```
data: {"delta": "chunk of text", "session_id": "..."}
data: {"done": true, "session_id": "..."}
```

```
POST /api/v1/chat/sessions
Body: { "title": "My conversation" }
Response: SessionResponse
```

```
GET /api/v1/chat/sessions
Response: [SessionResponse, ...]
```

```
GET /api/v1/chat/sessions/{session_id}
Response: SessionDetailResponse (includes messages)
```

---

### Audio

```
POST /api/v1/audio/transcribe
Body: multipart/form-data, field: file (audio file)
Response: { "text": "...", "language": "en", "segments": [...] }
```

Requires `faster-whisper` to be installed (`pip install faster-whisper`).

---

### Integrations

```
GET /api/v1/integrations/notion/status
Response: { "name": "notion", "connected": true/false, "message": "..." }
```

---

### Notion OAuth

```
GET /auth/notion/connect?state=<optional>
Response: { "auth_url": "https://api.notion.com/v1/oauth/authorize?..." }
```

```
GET /auth/notion/callback?code=<code>&state=<state>
Response: { "message": "...", "workspace_name": "...", "workspace_id": "..." }
```

Requires `NOTION_CLIENT_ID` and `NOTION_CLIENT_SECRET` to be set.

---

## 5. Running Tests

```bash
cd flobrain-core/alpha
pip install pytest pytest-asyncio httpx
pytest tests/ -v
```

Tests use an in-memory SQLite database. Ollama is mocked — tests pass without a running LLM.

---

## 6. How to Add a New Agent

1. **Create the agent file** in `agents/`:

```python
# agents/my_agent.py
from agents.base import AgentResponse, BaseAgent

class MyAgent(BaseAgent):
    name = "my_agent"
    description = "Does something specific."
    system_prompt = "You are a specialist at..."

    async def run(self, messages, context=None):
        content = await self._llm_complete(messages, context)
        return AgentResponse(content=content, agent_name=self.name)

my_agent = MyAgent()
```

2. **Register the agent** in `agents/workflows/engine.py`:

```python
from agents.my_agent import my_agent

self._agents = {
    "control": control_agent,
    "general": general_agent,
    "notion": notion_agent,
    "my_agent": my_agent,   # ← add here
}
```

3. **Update the routing prompt** in `agents/control.py`:

```python
ROUTING_PROMPT = """
...
- "my_agent": when the user asks about X, Y, Z
...
"""
KNOWN_AGENTS = ("general", "notion", "my_agent")
```

4. **Update the workflow definition** in `agents/workflows/definitions/default.yaml`:

```yaml
agents:
  my_agent:
    description: Handles X, Y, Z requests.
    triggers: [x, y, z]
```

---

## 7. How to Add a New Integration

1. **Create the integration directory**: `integrations/my_service/`

2. **Create the client** (`integrations/my_service/client.py`):

```python
from integrations.base import BaseIntegration

class MyServiceIntegration(BaseIntegration):
    @property
    def name(self): return "my_service"

    @property
    def description(self): return "Integrates with My Service."

    async def connect(self): ...
    async def disconnect(self): ...
    async def health_check(self): ...
```

3. **Add tools** (`agents/tools/my_service_tools.py`) following the pattern in `notion_tools.py`.

4. **Add an agent** that uses the tools (see section 6 above).

5. **Add a status endpoint** in `api/routes/integrations.py`.
