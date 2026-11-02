# FloBrain Memory — Implementation Handoff

Entry point for the coding agent (and its operator) that will repair FloBrain's memory system.

## Objective and scope

Turn FloBrain's existing Django/PostgreSQL/Chroma memory code into a **working, private, owner-scoped memory lifecycle**:

> save (explicit or captured from chat) → authoritative SQL record → derived vector index → owner-scoped, relevance-gated retrieval → injected into the request actually sent to the LLM service → correctable, excludable, deletable, cleaned up on account deletion.

In scope: `flobrain-core/backend/memory`, `flobrain-core/backend/brain`, the account-deletion path in `flobrain-core/backend/users`, the memory side panel in `flobrain-website/src/app/memory`, and Core backend CI.

Out of scope unless separately approved: the FastAPI `flobrain-cloud` prototype, the MongoDB/FAISS helpers, the external multimodal worker (`/process`), Celery/Hebbian learning, the tier-1 rANS codec, a new memory provider (for example Supermemory), deployments, and production data.

## Baseline

| Item | Value |
|---|---|
| Review date | 2026-11-02 |
| Audited revision | `67b0153a85468446ccd9a7593625b6297c357b51` ("Remove PolinRider malware from main", committed 2026-10-30) |
| `origin/main` at review time | same commit (fetched 2026-11-02) |
| Local checkout | branch `Fixing_memory`, same commit, clean working tree |
| Memory-relevant change since the 19 Oct audit (`ecb0a760`) | Only `brain/views.py`, `brain/llm/base.py` and `brain/llm/multimodal_adapter.py` changed (image forwarding). `memory/` is byte-identical. |
| `origin/development` | **Does not contain `flobrain-core/backend/memory` at all** (diff vs main deletes ~3,350 lines including `memory/views.py`, `memory/urls.py`). Branching from `development`, as the handbook prescribes for features, would lose the memory app. |

Deployed behavior was **not** inspected. Nothing here says what revision, configuration, keys or data any deployment uses.

## Source inventory and access limitations

| ID | Source | Accessed? | Notes |
|---|---|---|---|
| N1 | Notion task "Validate memory implementation" (Status: Done, last edited 2026-10-27) | Yes, full page plus its single comment thread | The deliverable is to validate whether `main` has the "Supermemory features necessary for FloBrain" and works correctly. It has no approved PRD. |
| N2 | Claude artifact "FloBrain Memory Implementation Review" (linked from N1) | Yes | 12-feature assessment. Some claims contradict the current code (see findings). |
| N3 | `FloBrain-Memory-Audit.pdf` (Mani, 19 Oct 2026, audited `ecb0a760`) | Yes, all 19 pages via text extraction | The most rigorous source: 16 findings, isolated checks, and release gates. |
| N4 | `FloBrain_Memory_Architecture_Report.pdf` (Saqlain Ahmed, 27 Oct 2026) | Yes, all 7 pages | Describes local changes to `brain/views.py`, `memory/tier_2.py`, `memory/embedding_service.py` and `memory/views.py`. **These changes are not in `main` or any remote branch** (checked 2026-11-02). |
| N5 | `FloBrain_Memory_Architecture_Report.docx` (draft of N4) | Not read | Superseded by the final PDF (N4). |
| N6 | Google Doc "FloBrain Memory Implementation Audit" | **No.** The Drive connector returned "Requested entity was not found". | Presumed to be the source of N3. Not reviewed. |
| N7 | Audit evidence bundle (`docs/audits/2026-10-19-memory/evidence/…`, cited by N3) | **No.** It is not in the repository or on any branch. | N3's isolated-check results are used as historical evidence only. |
| R | Repository: code, migrations, tests, CI, `docs/ENGINEERING_HANDBOOK.md`, `CONTRIBUTING.md`, `flobrain-website/CLAUDE.md` | Yes | No `AGENTS.md` or root `CLAUDE.md` exists. The only Claude guidance is `flobrain-website/CLAUDE.md` (frontend). |

Execution limits during this review: the findings were written from static reading of the current source plus historical evidence, and each one is labelled accordingly. After the operator chose Docker Compose, **only the T00 baseline** (Django check plus `memory.tests` and `users.tests`) was executed in the container (see "Baseline test run"). No frontend tests ran: the host has no Node.js or `node_modules`.

## Readiness assessment

- **Not ready for private, personalized memory.** At `67b0153a`:
  - The chat path never reads memory.
  - Nothing captures memory from chat.
  - Any authenticated user can read or edit another user's memory node by ID.
  - Saving with S3 reachable sends every node to cold storage.
  - The default archive key is all zeros.
  - Nothing can be deleted or excluded.
- **The foundations are usable.** There is an owner-scoped graph list, server-forced ownership on save, a SQL catalog, Chroma, BM25 ranking code, a context assembler, an adapter seam (`get_llm_adapter`) and a frontend graph. The evidence (N3 §G) supports **repair and consolidation, not a new provider or database**.
- **The handoff is implementable now.** The Docker Compose test environment (B1) is running from this checkout, and the baseline has been executed.

## Reading order

1. This README
2. [`CLAUDE_AGENT_CONTEXT.md`](CLAUDE_AGENT_CONTEXT.md): compact briefing and invariants
3. [`CURRENT_STATE_AND_FINDINGS.md`](CURRENT_STATE_AND_FINDINGS.md): architecture, Mermaid diagram, finding ledger (FM-xx)
4. [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md): ordered tasks T00–T14 plus optional items
5. [`ACCEPTANCE_AND_TEST_PLAN.md`](ACCEPTANCE_AND_TEST_PLAN.md): synthetic scenarios ACC-01…ACC-14
6. [`CLAUDE_LOOP_PROMPT.md`](CLAUDE_LOOP_PROMPT.md): copy-paste prompt and progress-ledger template

## Definition of done

The work is done when all of the following hold, each with **executed** evidence recorded in `docs/agent-handoff/memory/PROGRESS_LEDGER.md`:

1. Tasks T00–T13 are complete against their completion criteria, and **each has an APPROVE from a fresh, independent verifier subagent** that re-ran the tests itself (loop prompt STEP 6b). T14 (CI) is complete, or explicitly deferred by the operator. A final whole-lifecycle verifier run over ACC-01–ACC-12 also returned APPROVE.
2. ACC-01 through ACC-12 pass at the integration layer (Django test client, real SQL test database, real Chroma in a temp directory, faked LLM adapter capturing its input). ACC-13 and ACC-14 pass or are recorded as blocked with the reason.
3. Through every HTTP route and the retrieval path, a second synthetic user can neither read, mutate, list nor recall the first user's memories.
4. The text the adapter sends to the multimodal service (`text_input`) contains relevant owned memories, excludes unrelated, excluded, deleted, superseded and foreign memories, and stays within the configured budget.
5. No production data, credentials or deployments were touched. Every check is reported as passed, failed, blocked or unexecuted.

## Decisions and access required

B1 is resolved. D4 is needed only before any commit. D1–D3 have recommended defaults, and the plan proceeds on those unless the operator overrides them before the named task.

| ID | Type | What is needed | Blocks |
|---|---|---|---|
| **B1** | Access | **Decision (2026-11-02): Docker Compose.** **Status: resolved 2026-11-02.** The stack was rebuilt from this checkout with the dev `.env` below. All four containers are up, and the T00 baseline was executed (see "Baseline test run"). The operator must start Docker Desktop and create the dev `.env` from [the template below](#dev-env-for-docker-compose-b1). Without both, nothing can be verified. | T00 onward |
| D1 | Product | Capture mode. **Recommended default:** explicit save always available, plus automatic capture of *user-authored* chat messages only (not assistant replies) as `interaction` memories, behind `MEMORY_AUTO_CAPTURE` (default on in dev). LLM-based fact extraction and profiles are deferred. | T09 only |
| D2 | Product/legal | Forget semantics. **Recommended default:** "Exclude" is a soft flag that removes the memory from recall immediately and is reversible. "Delete" removes it from SQL, Chroma, cache and the S3 object, using a retryable cleanup. Account deletion deletes all of the owner's memories. Memories captured from a chat survive deletion of that chat. Backup retention is outside this work, so no "GDPR-complete" claim. | T11, T12 |
| D3 | Engineering/ops | Embedding model. **Recommended default:** Chroma's built-in default embedding function (all-MiniLM-L6-v2, ONNX), with no new Python dependency, in a new versioned collection. The model is downloaded on first use, so the dev container needs network access once or a pre-baked cache. Tests inject a deterministic fake embedding function. | T05 |
| D4 | Process | Branch and PR target. `development` lacks the memory app, so the operator must choose the base branch. Commits and PRs happen only on explicit operator authorization. | Any commit or PR |

## Dev `.env` for Docker Compose (B1)

`docker-compose.yml` loads `env_file: .env` and the `web` service fails to start without it. The operator creates `flobrain-core/backend/.env` (already gitignored). **Use only throwaway, non-secret values. Never copy a real environment's file.** The agent must not read or print this file.

```dotenv
DEBUG=True
SECRET_KEY=dev-only-not-a-secret-local-docker-key-0123456789abcdef   # ≥32 chars, otherwise PyJWT warns InsecureKeyLengthWarning
# Stop the default public multimodal URL from receiving prompts during manual dev use.
# Port 9 on localhost refuses connections, so the adapter returns its "unavailable" message.
MULTIMODAL_SERVICE_URL=http://127.0.0.1:9
MULTIMODAL_API_KEY=
# Leave the AWS_*, S3_*, AES_MASTER_KEY and SMTP_* variables unset: no cold archive and no email in dev.
```

The compose file already sets DB, Mongo and Redis hosts for the containers. Until T03 lands, saves with S3 unset are expected to spend a few seconds in boto3 retries (FM-07 hypothesis). That delay is not an environment fault.

**Switch performed 2026-11-02 (operator-approved).** This checkout's `.env` was created, then `docker compose up -d --build` was run from `FloBrain/flobrain-core/backend`:

- The image built in about 105 s.
- `flobrain_backend_{db,redis,mongodb,django}` were recreated from this checkout and are up. A new `backend_mongo_data` volume was created.
- The startup `migrate` reported "No migrations to apply".
- The dev Postgres row counts are unchanged afterwards (2 users, 2 chats, 0 memory nodes).

The notes below describe the state *before* the switch.

**Docker state before the switch (observed 2026-11-02, read-only):**

- **The running compose project `backend` comes from an old checkout,** `C:\My AI coding programs\Projects for work\Caipo-FloLabs\flobrain-core\backend`. That folder no longer holds the code: Docker recreated it as an empty directory.
- **`flobrain_backend_django` is in a restart loop** (`python: can't open file '/app/manage.py'`). `flobrain_backend_db` and `flobrain_backend_redis` are up. The old `backend-mongodb-1` exited 7 weeks ago.
- **The dev Postgres volume `backend_postgres_data`** (created 2026-08-25) holds 2 users, 2 chats, 0 messages and 0 memory nodes. Its migrations match `main`. Treat its rows as private local dev data: do not print or export them.
- **This checkout's compose file resolves to the same project name (`backend`) and the same fixed container names.** Running `docker compose up` from `FloBrain\flobrain-core\backend` therefore *replaces* the old containers, rebinding `/app` to this checkout. It *reuses* `backend_postgres_data`, and the startup `migrate` applies any new migrations to it. It creates a new `flobrain_backend_mongodb` with a fresh `backend_mongo_data` volume. A separate project name (`-p`) does not avoid this, because the containers have fixed `container_name` values that would conflict.

**Operator commands (from `flobrain-core/backend`, Docker Desktop running):**

```bash
docker compose up -d --build
```

```bash
docker compose ps
```

The first build downloads base images and PyPI packages, so it needs network access. On every start, the `web` command runs `migrate` against the **local container** Postgres. The agent then runs the T00 baseline inside the container:

```bash
docker compose exec web python manage.py check
```

```bash
docker compose exec web python manage.py test memory.tests users.tests --noinput
```

Tests use a separate `test_flobrain_db`, created by Django in the container Postgres. Chroma writes to `/app/vector_db`, which is bind-mounted to `flobrain-core/backend/vector_db/` (gitignored). Do not run `manage.py test memory` (the whole app) until T01 is done: the import-time demo scripts would write to the container MongoDB.

## Baseline test run (T00, executed 2026-11-02 at `67b0153a`)

| Command (in `flobrain-core/backend`) | Observed |
|---|---|
| `docker compose exec -T web python manage.py check` | "System check identified no issues (0 silenced)." Exit 0. |
| `docker compose exec -T web python manage.py test memory.tests users.tests --noinput -v 2` | Ran 8 tests: **7 ok, 1 error**. Exit 1. |

- **Error:** `memory.tests.MemoryAPITestCase.test_graph_maps_api_visualization_fields_to_model_fields` raised `KeyError: 'node-primary'` at `memory/tests.py:45`. The fixtures use the default owner `"system"` while the graph view filters by the user's ID (FM-15), as predicted.
- **Passing tests that show a defect:** `test_detail_maps_node_and_connection_fields` and both PATCH tests return 200 for a node the authenticated user does **not** own (owner `"system"`). This is executed evidence of FM-01 on current code.
- The 4 `users.tests` pass.
- A first run with a 31-character `SECRET_KEY` produced PyJWT `InsecureKeyLengthWarning`s. A 52-character key removed them; the results were identical.

The implementation agent should treat this as the T00 baseline. T00 is Done once it re-runs these commands and records them in `PROGRESS_LEDGER.md`.

## Side observations (not part of the memory work)

- `main`'s head commit is a malware cleanup (`.vscode/settings.json` auto-run settings and a fake font removed). The agent should not re-add `.vscode` auto-run tasks and should report any auto-executing editor configuration it encounters.
- `flobrain-core/backend/flobrain/settings.py:184-186` defaults `MULTIMODAL_SERVICE_URL` to a public IP address. Any run that reaches `SendMessageView` without overriding it sends prompt text to that external service. Tests must fake the adapter.
