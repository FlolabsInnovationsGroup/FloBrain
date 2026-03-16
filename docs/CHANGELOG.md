# CHANGELOG

## [Unreleased] - 2026-03-16

### Fixed — FloBrain Chat End-to-End UX

- **Optimistic UI**: User message now appears immediately on send (before backend round-trip); reverted on error
- **Typing indicator**: Animated three-dot bounce indicator shown while Ollama is processing
- **next.config conflict**: Removed duplicate `next.config.ts`; cleaned `next.config.js` to minimal config
- **Health endpoint model info**: `GET /api/dashboard/health/` now returns `model` and `availableModels` fields for visibility



### Added — Local Dev Environment Setup (Skynet AI)

**Goal:** Run the full FloBrain stack locally (simulating AWS), connecting the existing `flobrain-website` UI to the `flobrain-core/alpha` backend.

#### `flobrain-core/alpha/api/routes/compat.py` (new file)
A compatibility router that maps the frontend-expected API paths to the existing backend logic, without touching the original routes. Bridges:
- `POST /api/auth/signin/` — login by email (frontend uses email, backend used username)
- `POST /api/auth/register/` — register with `name` field (frontend) mapped to `username`
- `POST /api/auth/signout/` — stateless JWT signout (returns 200)
- `POST /api/auth/refresh/` — issues new access token from refresh token
- `GET/PATCH /api/profile/` — returns `{id, fullName, email}` shape expected by frontend
- `POST /api/profile/change-password/` — updates password hash
- `POST /api/profile/delete/` — deletes account with password confirmation
- `GET /api/memory/graph/` — returns session-based knowledge graph `{nodes, links}`
- `GET /api/dashboard/health/` — real health check (Ollama + SQLite)
- `GET /api/dashboard/memory-activity/` — live message stats + 7-day heatmap
- `GET/POST /api/brain/chats/` — list/create chat sessions with integer IDs
- `GET/PATCH/DELETE /api/brain/chats/{id}/` — read, rename, delete chats
- `POST /api/brain/chats/{id}/send/` — send message, run AI workflow, return full updated chat

**Integer chat IDs:** stored as `session_metadata["int_id"]` (auto-incremented per user) — no schema migration needed.

#### `flobrain-core/alpha/main.py` (modified)
Registered `compat_router` without a URL prefix so all `/api/auth/…`, `/api/brain/…`, `/api/dashboard/…`, `/api/profile/…`, and `/api/memory/…` paths resolve correctly.

#### `flobrain-core/alpha/.env` (new file)
Local development environment config:
- `DEBUG=true`, `HOST=0.0.0.0`, `PORT=8000`
- Ollama at `localhost:11434`, model `llama3.2`
- SQLite at `./data/flobrain.db`
- CORS: `http://localhost:3000`, `http://127.0.0.1:3000`
- JWT secret for local dev

#### `flobrain-website/.env.local` (new file)
Points the Next.js frontend at the local backend:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### How to Run Locally

```bash
# Terminal 1 — Backend (port 8000)
cd flobrain-core/alpha
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Frontend (port 3000)
cd flobrain-website
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

**Note:** The AI chat endpoint (`/api/brain/chats/{id}/send/`) requires [Ollama](https://ollama.ai) running locally with the `llama3.2` model pulled (`ollama pull llama3.2`). Without Ollama, the dashboard will show `degraded` status but all other UI features (auth, chat history, dashboard) will work.

---

_Changes by: Skynet (AI assistant) for Oliver Benjamin / FloLabs R&D_
