# FloBrain — Login and Chat Fix Handoff

Handoff for whoever continues this work. It covers the bugs, root causes, the code changes, how to run locally, and how to deploy so production is fixed.

**Current status**

| Environment | Sign-in | Chat |
|---|---|---|
| Local codebase (after these changes) | Fixed | Fixed |
| `www.flobrain.ai` / `api.flobrain.ai` | Still the old frontend | Still returns a stub reply |

Production **will not** be fixed until both frontend and backend are deployed with the env vars in section 5.

---

## 1) Sign-in bug

### Symptom

The site shows:

`Couldn't connect to FloBrain`

as if the backend is down. Sign-in worked locally, not online.

### What was actually true

The backend **is up**.

- `https://api.flobrain.ai/` → 200
- `https://api.flobrain.ai/api/dashboard/health/` → database `connected`
- CORS from `www.flobrain.ai` works
- `POST /api/auth/signin/` from the browser via `fetch` correctly returns `401 Invalid credentials`

The deployed frontend already has `NEXT_PUBLIC_API_URL=https://api.flobrain.ai/` baked in at build time. The API URL is correct.

### Root cause

In `flobrain-website/src/lib/axios.ts`, every `401` was treated as an expired access token.

Sequence:

1. User clicks Sign In with a wrong password, or an account that does not exist in the production database
2. Backend returns `401 Invalid credentials`
3. The Axios interceptor tries to refresh the token
4. There is no refresh token → it throws `No refresh token`
5. Error normalization maps any Error without a `response` to **Couldn't connect to FloBrain**

Locally the account usually already existed in the local database (HTTP 200), so the interceptor never ran.

### Fix (already in the code)

File: `flobrain-website/src/lib/axios.ts`

1. Do **not** attempt refresh on:
   - `/api/auth/signin/`
   - `/api/auth/register/`
   - `/api/auth/refresh/`
2. If there is no refresh token in `localStorage`, reject the original 401
3. If refresh itself fails, reject the original 401, not `No refresh token`

After the fix, a failed login shows **Invalid credentials**, not the connect message.

Tests: `flobrain-website/src/lib/axios.interceptor.test.ts`

```bash
cd flobrain-website
npm test -- src/lib/axios.interceptor.test.ts src/lib/api.normalizeError.test.ts
```

All 6 tests should pass.

---

## 2) Chat bug

### Symptom

Online chat returns a canned reply instead of a real AI response.

### What was actually true

Direct production probe:

```text
POST https://api.flobrain.ai/api/auth/register/     → 201
POST https://api.flobrain.ai/api/brain/chats/       → 201
POST https://api.flobrain.ai/api/brain/chats/<id>/send/
```

The assistant reply was:

```text
I received your message: "...". This is a placeholder response. Connect an LLM for real replies.
```

That string **does not exist in the current repo**. So `api.flobrain.ai` is still running an **old stub build**.

Current repo code calls the multimodal service:

`POST {MULTIMODAL_SERVICE_URL}/process`

The worker itself is healthy:

`http://35.153.90.219:8000/process` → real replies (for example `Hello.` / `Hi!`)

### Why env vars were not read correctly

Django called `load_dotenv()` with no path. It searches for `.env` from the process working directory, not from a fixed backend folder.

`MULTIMODAL_SERVICE_URL` was not defined in `settings.py`. The adapter tried `getattr(settings, ...)` then `os.environ`. If the file was not loaded, or the server did not have the variable, chat failed or stayed on the old stub.

### Variables people set that the backend does not use for chat

Django **does not read** these for chat:

| Variable | Read? |
|---|---|
| `LLM_PROVIDER` | No |
| `LLM_DEFAULT_MODEL` | No |
| `OPENAI_API_KEY` | No, not in `flobrain-core` |
| `ANTHROPIC_API_KEY` | No |
| `INTERNAL_API_KEY` | No |
| `NEXT_PUBLIC_API_URL` | No — frontend only |

Chat always uses `MultimodalLLMAdapter` from:

`flobrain-core/backend/brain/llm/__init__.py`

If an OpenAI key is needed, it belongs on the **multimodal worker** (`35.153.90.219`), not in the Django env file.

`NEXT_PUBLIC_*` must be set in **Vercel** (at build time) or in `flobrain-website/.env.local`. Putting them in the backend `.env` does nothing for Next.js.

### Fix (already in the code)

File: `flobrain-core/backend/flobrain/settings.py`

1. Load `.env` from a fixed path:

```python
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
```

2. Define LLM settings:

```python
MULTIMODAL_SERVICE_URL = os.environ.get(
    "MULTIMODAL_SERVICE_URL", "http://35.153.90.219:8000"
).rstrip("/")
MULTIMODAL_API_KEY = os.environ.get("MULTIMODAL_API_KEY", "")
MULTIMODAL_SERVICE_TIMEOUT = int(os.environ.get("MULTIMODAL_SERVICE_TIMEOUT", "60"))
```

3. Strip empty values from `CSRF_TRUSTED_ORIGINS`
4. Support `DB_ENGINE=sqlite` for local runs without Postgres

Extra change so Django can start locally without `chromadb`:

`flobrain-core/backend/memory/views.py`  
Imports of `tier_1` / `tier_2` / `tier_3` moved inside `MemorySaveView.post` instead of module import time. Chat does not need chromadb.

After wiring locally, “Say hi in one short word.” returned **Hi!** from the LLM service.

---

## 3) Files that changed

| File | Why |
|---|---|
| `flobrain-website/src/lib/axios.ts` | Fix the 401 interceptor |
| `flobrain-website/src/lib/axios.interceptor.test.ts` | Interceptor tests |
| `flobrain-core/backend/flobrain/settings.py` | Load `.env` + `MULTIMODAL_*` + optional sqlite |
| `flobrain-core/backend/memory/views.py` | Defer heavy imports so the backend can start |

Local-only files (do **not** commit — runtime config):

| File | Contents |
|---|---|
| `flobrain-website/.env.local` | `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` |
| `flobrain-core/backend/.env` | See section 4 |

---

## 4) Run the project locally (same steps used here)

### Backend — Django

Create `flobrain-core/backend/.env`:

```env
DEBUG=True
DB_ENGINE=sqlite
SECRET_KEY=django-local-chat-dev
ALLOWED_HOSTS=localhost,127.0.0.1
MULTIMODAL_SERVICE_URL=http://35.153.90.219:8000
MULTIMODAL_API_KEY=
```

Then:

```bash
cd flobrain-core/backend
python -m venv .venv
.\.venv\Scripts\activate
pip install "Django>=5.2,<6.0" django-cors-headers djangorestframework djangorestframework-simplejwt drf-spectacular PyJWT python-dotenv pymongo numpy
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

On real production use Postgres (do not set `DB_ENGINE=sqlite`) and `pip install -r requirements.txt`.

Check:

```text
GET http://127.0.0.1:8000/api/dashboard/health/
```

Expect `"database":"connected"`.

### Frontend — Next.js

Create `flobrain-website/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

```bash
cd flobrain-website
npm install
npm run dev
```

Open `http://localhost:3000`.

Important: `NEXT_PUBLIC_*` is read when Next starts/builds. If you change `.env.local`, restart `npm run dev`.

### Verify chat

1. Register a new account at `/register`, or:

```bash
# example
POST http://127.0.0.1:8000/api/auth/register/
{"name":"...","email":"...","password":"..."}
```

2. Sign in at `/signin`
3. Go to `/brain` and send a message

Expect: a real LLM reply, not the placeholder, and not “Couldn't connect to FloBrain”.

Wrong password: **Invalid credentials**.

---

## 5) What must happen for production to be fixed

The code change alone is not enough. The live servers are still old.

### A) Deploy the backend to `api.flobrain.ai`

Ship the current `flobrain-core/backend` (the one with `MULTIMODAL_*` in settings).

On the Django host (systemd / Docker / panel) set at least:

```env
DEBUG=False
SECRET_KEY=<strong key, 32+ bytes>
ALLOWED_HOSTS=api.flobrain.ai
CSRF_TRUSTED_ORIGINS=https://www.flobrain.ai,https://api.flobrain.ai
DB_NAME=...
DB_USER=...
DB_PASS=...
DB_HOST=...
DB_PORT=5432
MULTIMODAL_SERVICE_URL=http://35.153.90.219:8000
MULTIMODAL_API_KEY=
```

Then restart Django (gunicorn/uwsgi).

Confirm the Django host can reach `http://35.153.90.219:8000` (security group / firewall). The worker is HTTP, not HTTPS; the call is server-to-server.

### B) Deploy the frontend on Vercel

In Vercel Environment Variables (Production + Preview):

```env
NEXT_PUBLIC_API_URL=https://api.flobrain.ai
```

Prefer no trailing slash (`https://api.flobrain.ai`). The code strips a trailing slash if present.

After saving: **Redeploy / Rebuild**. `NEXT_PUBLIC_*` is not picked up at runtime; it needs a new build.

### C) Verify after deploy

```text
GET  https://api.flobrain.ai/api/dashboard/health/
POST https://api.flobrain.ai/api/auth/signin/          → Invalid credentials if the account is wrong
POST https://api.flobrain.ai/api/brain/chats/<id>/send/ → real LLM reply, not the placeholder
```

On `www.flobrain.ai/signin`: a wrong account shows Invalid credentials. After a real login, chat replies from the AI.

If you still see `Connect an LLM for real replies`, the backend deploy **did not land**, or the process is still serving the old directory.

---

## 6) Notes for whoever continues

- Do not mix frontend and backend env vars in one file.
- The contact form currently uses `setTimeout` and never posts to `/api/contact/`. That is out of scope for this login/chat fix.
- If an OpenAI key was pasted in chat or a ticket, rotate it in the OpenAI dashboard.
- A short local `SECRET_KEY` triggers a JWT warning; use a long key in production.
- There is no CI that deploys `flobrain-core` to `api.flobrain.ai`. Backend deploy is manual. The frontend deploys via Vercel / GitHub Actions.

---

## 7) Short summary

1. The online backend was not down. The frontend swallowed `401` and showed “Couldn't connect”.
2. Online chat was an old stub, and `MULTIMODAL_SERVICE_URL` was not defined in Django settings.
3. Both are fixed in this repo. Locally, chat replies from `35.153.90.219`.
4. Production is fixed only after backend + frontend deploy and the env vars in section 5.
