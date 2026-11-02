# Claude Agent Context: FloBrain Memory Fix

A compact briefing. Details live in the sibling documents; do not duplicate them, refer to them.

## Product goal
A user's facts persist across conversations and appear in the request FloBrain sends to its LLM service. Only the owner can see, recall, correct, exclude or delete them, and they are removed when the account is deleted. These are proposed acceptance criteria; no approved PRD exists.

## Baseline
`67b0153a` (= `origin/main` on 2026-11-02). If your HEAD differs, follow the revalidation step in the loop prompt.

## Architecture in five lines
- `brain/views.py` `SendMessageView` → `_build_llm_messages` (**this chat's history only**) → `brain/llm/multimodal_adapter.py` flattens to `text_input` → external `POST /process`.
- `memory/views.py`: graph (owner-scoped), node detail/PATCH (**not owner-scoped**), save (`sorter` → unconditional S3 archive → Chroma only with a client-supplied vector).
- SQL `memory/models.py` `MemoryNode` (string `owner_id`, no content/exclusion/version fields) is the only durable catalog. Chroma (`/app/vector_db`, created at import), a LocMem tier-1 cache and S3 are derived.
- `memory/context_assembler.py` and `tier_2.hybrid_search` exist but are unused by chat.
- Mongo/FAISS helpers, `flobrain-cloud`, Celery tasks and the rANS codec are **off the path. Leave them disconnected.**

## Invariants you must preserve or establish
- **I1:** SQL `MemoryNode` is the source of truth. Chroma, cache and S3 are rebuildable.
- **I2:** every retrieved ID is re-joined to SQL with `owner_id=caller`, not excluded, not superseded, and existing, before use.
- **I3:** owner identity comes only from `get_user_from_request`. Ignore payload `owner_id` and `id`.
- **I4:** memory failures degrade and stay visible. Never report a failure as success, and never 500 the chat because of memory.
- **I5:** memory enters the prompt as delimited reference data.
- **I6:** tests never contact external services (multimodal URL, S3, model downloads, shared Mongo).

## Critical file map (backend under `flobrain-core/backend/`)
| Purpose | File |
|---|---|
| Chat orchestration | `brain/views.py`, `brain/llm/multimodal_adapter.py`, `brain/llm/__init__.py` |
| Memory API and routes | `memory/views.py`, `memory/urls.py` |
| Create and dedup | `memory/sorter.py` |
| Schema | `memory/models.py`, `memory/migrations/` |
| Vector + BM25 | `memory/tier_2.py` |
| Archive | `memory/tier_3.py` |
| Cache / codec | `memory/tier_1.py` (do not rely on tokens) |
| Context builder | `memory/context_assembler.py` |
| Auth helper, account deletion | `users/views.py` (`get_user_from_request`:195, `DeleteAccountView`:284) |
| Settings | `flobrain/settings.py` (`DB_ENGINE=sqlite` :95; `MULTIMODAL_SERVICE_URL` defaults to a public IP :184) |
| Tests | `memory/tests.py` (fixture owner bug), `users/tests.py`; `memory/test_*.py` are Mongo-writing scripts, not tests |
| Frontend | `flobrain-website/src/app/memory/components/memory-node-side-panel.tsx`, `flobrain-website/src/lib/api.ts` |
| CI | `.github/workflows/backend-ci.yml` (Cloud only), `website-ci.yml` (no Vitest) |

## Repository instructions to read
- `CONTRIBUTING.md` and `docs/ENGINEERING_HANDBOOK.md`: semantic commits, `feat/…` / `fix/…` branches, PRs target `development`. **But `origin/development` lacks the memory app.** The base branch is the operator's decision (D4).
- `flobrain-website/CLAUDE.md` for any frontend change: `--fb-*` tokens, TanStack Query mutations, no inline colors.
- There is no `AGENTS.md` or root `CLAUDE.md`. Do not create or overwrite them.

## Environment and commands
- **Executed 2026-11-02 in the Docker `web` container:** `docker compose exec -T web python manage.py check` (clean) and `… test memory.tests users.tests --noinput` (7/8 pass; the graph test errors with `KeyError` from fixture owner `"system"`). The stack runs from this checkout, and `.env` exists (do not read it). There is no Node.js on the host.
- Confirmed in the repo: `docker compose up --build` / `docker compose exec web python manage.py …` from `flobrain-core/backend` (needs a `.env`); `npm test|lint|typecheck` in `flobrain-website`.
- Proposed: `DB_ENGINE=sqlite python manage.py test memory.tests users.tests --noinput`. **Do not run `manage.py test memory` before T01**, because it imports the Mongo-writing scripts.
- Never read or print a real `.env`, and never use production credentials.

## Task order
T00 env/baseline → T01 test safety → **T02 owner-scope detail/PATCH** → T03 archive safety → T04 schema → T05 embeddings/index → T06 save contract → T07 retrieval → T08 chat injection → T09 capture → T10 correction → T11 exclude/delete + UI → T12 account cleanup → T13 reconcile/restart → T14 CI. Details are in `IMPLEMENTATION_PLAN.md`.

## Non-goals and boundaries
- No new memory provider or vector database. No Mongo/FAISS or Cloud wiring. No Celery or schedulers. No LLM fact extraction (O6).
- No production access, deployments, production migrations, or destructive operations on non-test data.
- Commits, branches and PRs only with explicit operator authorization.
- Leave unrelated files alone, including `.vscode/` (recently cleaned of malware auto-run settings).

## Known blockers
- **B1: resolved.** Docker Compose is running from this checkout (2026-11-02). If Docker Desktop is closed, the stack must be restarted (`docker compose up -d` from `flobrain-core/backend`). If that fails, record T00 as Blocked.
- **D1–D3** have defaults (README). **D4** (branch base) is needed before any commit.
- The internals of the external `/process` service are unknown.

## Where to look
- Findings and evidence: `CURRENT_STATE_AND_FINDINGS.md`
- Tasks and completion criteria: `IMPLEMENTATION_PLAN.md`
- Scenarios and test layers: `ACCEPTANCE_AND_TEST_PLAN.md`
- Loop protocol and ledger: `CLAUDE_LOOP_PROMPT.md`
- Progress (create on first iteration): `docs/agent-handoff/memory/PROGRESS_LEDGER.md`
