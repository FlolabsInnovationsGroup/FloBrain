# Implementation Plan

Baseline `67b0153a`. Finding IDs (FM-xx) are defined in [CURRENT_STATE_AND_FINDINGS.md](CURRENT_STATE_AND_FINDINGS.md). Scenario IDs (ACC-xx) are defined in [ACCEPTANCE_AND_TEST_PLAN.md](ACCEPTANCE_AND_TEST_PLAN.md). All paths are relative to the repository root, and backend paths are under `flobrain-core/backend/`.

## Target design (recommended)

**Authoritative truth:** the PostgreSQL `MemoryNode` row. It gains a canonical `content` and the state fields listed in T04.

**Derived stores**, all rebuildable from SQL:

- Chroma vector index: a new versioned collection
- tier-1 LocMem cache: optional, never read for truth
- S3 archive: opt-in, backup only

**Invariants**

- **I1:** SQL decides what exists. Derived stores never add facts.
- **I2:** Every retrieved ID is re-joined to SQL with `owner_id = caller`, `is_excluded = False`, `superseded_by IS NULL`, and the row must exist. A stale vector or cache entry can only cause a *miss*, never a leak or the return of a deleted memory.
- **I3:** Owner identity comes only from the authenticated token. Payload `owner_id` and `id` are ignored.
- **I4:** Memory failures degrade, they do not fail. Chat still answers. The failure is logged, recorded in `index_status`, and reported in the response. A failure is never reported as success.
- **I5:** Memory content enters the prompt as delimited reference data, not instructions.
- **I6:** Tests never contact external services: no multimodal service, no S3, no embedding-model download, no shared MongoDB.

**Why this approach:** it reuses the existing Postgres catalog, Chroma, BM25 code, assembler and adapter seam. It fixes root causes (unscoped queries, no server-side embedding, no chat integration, no lifecycle state) without adopting Mongo/FAISS, the Cloud prototype or a new provider. N3 §F reaches the same conclusion.

**Considered and rejected for now:**

- Wiring in the Mongo/FAISS `build_llm_context`. It has global top-k with a post-filter and unscoped graph expansion (FM-16).
- Supermemory. It would not fix API authorization, the inert UI, the delete contract or prompt integration (N3 §F).
- An outbox table or Celery. `index_status` plus a reconcile command gives durable retry without new infrastructure, since no worker runs today.

## Task order and dependencies

| Order | Task | Findings | Depends on | Priority |
|---|---|---|---|---|
| 1 | T00 Environment and baseline | FM-15 | B1 access | P0 |
| 2 | T01 Test safety and lazy clients | FM-15, FM-19 | T00 | P0 |
| 3 | T02 Owner-scope node detail and PATCH | FM-01 | T01 | P0 |
| 4 | T03 Cold archive: opt-in, key required, tier-conditional, URI fix | FM-02, FM-07, FM-10 | T01 | P0 |
| 5 | T04 Authoritative memory schema | FM-03, FM-04, FM-11, FM-12 (foundation) | T02 | P1 |
| 6 | T05 Server-side embedding and vector indexing | FM-08, FM-18 | T04, D3 | P1 |
| 7 | T06 Save endpoint contract | FM-04, FM-12 | T05 | P1 |
| 8 | T07 Retrieval with eligibility gate | FM-09, FM-13 (assembler part) | T05 | P1 |
| 9 | T08 Inject memory into the chat LLM request | FM-05, FM-13 | T07 | P1 |
| 10 | T09 Capture from chat | FM-06 | T06, T08, D1 | P1 |
| 11 | T10 Correction and supersession propagation | FM-11, FM-03 (log content) | T06, T07 | P1 |
| 12 | T11 Exclude and delete (API + UI) | FM-03, FM-17 | T07, T10 | P0/P1 |
| 13 | T12 Account-deletion cleanup | FM-03 | T11, D2 | P0/P1 |
| 14 | T13 Reconciliation command and restart persistence | FM-04, FM-07 | T11 | P1 |
| 15 | T14 Core backend CI | FM-15 | T01 (can run any time after it, with operator OK) | P1 |

Optional, not required for done: O1–O6 at the end.

---

### T00 · Establish a runnable isolated environment and record the baseline
- **Findings:** FM-15. **Prerequisite:** B1. **Operator choice (2026-11-02): Docker Compose.** Docker Desktop must be running and the operator must have created the non-secret dev `flobrain-core/backend/.env` from the README template. The agent never reads or prints `.env`. If the compose stack cannot start, record T00 as Blocked; do not fall back to a local venv install without new authorization.
- **Outcome:** a documented, repeatable command that runs the Core backend tests against an isolated database.
- **Guidance:**
  - Run tests inside the `web` container against the container Postgres (Django creates a separate test database). `DB_ENGINE=sqlite` (`flobrain/settings.py:95-101`) is an optional faster variant for unit-level loops.
  - Run test **labels**, not the whole `memory` app. `manage.py test memory` imports `memory/test_*.py` demo scripts that write to MongoDB.
  - Record the Chroma version actually installed (`requirements.txt` says `chromadb>=0.4.0`, which is unpinned, and the API differs across versions).
- **Verification** (from `flobrain-core/backend`):
  - `docker compose up -d --build`, then `docker compose ps` (all services healthy)
  - `docker compose exec web python manage.py check`
  - `docker compose exec web python manage.py test memory.tests users.tests --noinput` (container Postgres test DB; `-e DB_ENGINE=sqlite` is an acceptable faster variant)
- **Completion criteria:** the exact commands and their observed output are recorded in the ledger. Each of the 4 `memory.tests` tests is recorded as pass or fail; `test_graph_maps_api_visualization_fields_to_model_fields` is *predicted* to fail. No application code changed.

### T01 · Make tests safe and runtime clients lazy and configurable
- **Findings:** FM-15, FM-19.
- **Outcome:**
  - Running the memory test suite cannot write to MongoDB, contact S3, download models or call the multimodal service.
  - Importing `memory.tier_2` and `memory.tier_3` has no side effects.
- **Affected:**
  - `memory/test_crud.py`, `test_mongo.py`, `test_knowledge_graph.py`, `test_embeddings.py`, `test_hybrid_retrieval.py`. Move them to a non-discovered location (for example `memory/scripts/`, renamed without the `test` prefix) and keep their content unchanged.
  - `memory/tier_2.py` (Chroma client and collection created at import).
  - `memory/tier_3.py` (boto3 client and cipher created at import).
  - `flobrain/settings.py`: add `MEMORY_VECTOR_DB_PATH` (default `/app/vector_db`), `MEMORY_VECTOR_COLLECTION`, `MEMORY_COLD_STORAGE_ENABLED` (default `False`), and placeholders for later tasks.
- **Guidance:**
  - Initialize clients on first use from settings. Tests point Chroma at a temp directory per test class and patch `memory.views._log_memory_event`.
  - Add a shared test helper that fakes `brain.views.get_llm_adapter` or patches `urllib.request.urlopen` inside `brain.llm.multimodal_adapter` and captures the request body.
  - Do not change behavior beyond laziness and configuration.
- **Verification:** `manage.py test memory brain users --noinput` (whole apps are now safe) passes with the MongoDB and multimodal hosts unreachable. One way to show this: set `MONGO_HOST` and `MULTIMODAL_SERVICE_URL` to an unroutable address and confirm that tests neither hang nor make network calls.
- **Completion criteria:**
  - No `test*.py` module in `memory/` executes I/O at import.
  - The demo scripts still exist under the new path.
  - The suite passes offline, apart from the baseline-failing graph test, which is fixed in T02.
- **Rollback:** a file move plus lazy initialization. Revert the commit.

### T02 · Owner-scope node detail and PATCH (first real fix)
- **Findings:** FM-01. **Prerequisite:** T01.
- **Outcome:** `GET` and `PATCH /api/memory/nodes/<id>/` operate only on the caller's nodes, and connection lists contain only the caller's nodes.
- **Affected:** `memory/views.py` `MemoryNodeDetailView` (:140-224); `memory/tests.py` fixtures (set `owner_id=str(self.user.id)`).
- **Guidance:**
  - Return 404 for foreign and nonexistent IDs alike, so existence is not disclosed.
  - Apply the same owner filter to `outgoing_links` and `incoming_links` targets.
  - Do not change graph or save behavior.
- **Verification:** new two-user tests (ACC-04 rows 1–3) plus the existing 4 tests.
- **Completion criteria:** user B gets 404 on A's node for GET and PATCH, and A's row is unchanged afterwards. Connections exclude foreign nodes. All `memory.tests` pass.

### T03 · Cold archive: opt-in, key required, tier-conditional, correct URI binding
- **Findings:** FM-02, FM-07, FM-10.
- **Outcome:**
  - Saves are no longer routed to tier 3 unconditionally.
  - No archive is written unless `MEMORY_COLD_STORAGE_ENABLED` is true and a valid 64-hex-character `AES_MASTER_KEY` is configured.
  - Hydration uses `metadata.vault_uri`.
- **Affected:** `memory/views.py:247-253`, `memory/tier_3.py:207-231`, `memory/context_assembler.py:87-95`.
- **Guidance:**
  - Call `migrate_to_cold_storage` only when the routed tier is 3 *and* archival is enabled.
  - When archival is disabled, a tier-3 node stays in SQL, which still holds `content` after T04, and is indexed like any other node.
  - Remove the zero-key default. When archival is enabled with a missing or invalid key, log an error and refuse to archive. Do not crash unrelated startup.
  - Fake S3 at the boto3 client boundary in tests. Never use a real bucket.
- **Verification:** ACC-09.
- **Completion criteria:**
  - A high-importance save stays tier 1 and reaches the vector layer.
  - With archival disabled, nothing calls S3.
  - With archival enabled and the key missing, no cipher is built and the save still succeeds in SQL.
  - Hydration of a node whose text exists only in the (faked) archive returns that text.
- **Migration and rollback:** none. **Ops note:** it is unknown whether any environment has archived data under the zero key. That is an operations follow-up; do not attempt re-encryption here.

### T04 · Authoritative memory schema
- **Findings:** foundation for FM-03, FM-04, FM-11 and FM-12. **Prerequisite:** T02.
- **Outcome:** `MemoryNode` can represent canonical content, provenance, exclusion, supersession and derived-index state.
- **Affected:** `memory/models.py`; new migration `memory/migrations/0002_…`.
- **Guidance (fields):**
  - `content` (TextField, canonical text; `name` stays a display title)
  - `is_excluded` (bool, indexed)
  - `superseded_by` (nullable self-FK, `SET_NULL`)
  - `source_chat_id` and `source_message_id` (nullable integers, not foreign keys, so memories survive chat deletion per D2)
  - `index_status` (`pending` / `indexed` / `failed`) and `index_error`
  - a conditional unique constraint on `(owner_id, source_message_id)` where `source_message_id` is not null
- **Backfill:** a data migration sets `content = metadata.raw_text or name` and recomputes `content_hash` from `content`. Keep `metadata.raw_text` mirrored on write during this transition, for backward compatibility with any reader.
- **Verification:**
  - `makemigrations --check` is clean after the migration is added.
  - The migration applies and reverses on SQLite and on compose Postgres.
  - A backfill test covers rows with raw text, rows without raw text, and the empty case.
- **Completion criteria:** the forward and backward migration runs are recorded, the backfill test passes, and existing tests pass.
- **Rollback:** the reverse migration drops the new columns. Content edits made after the migration survive in `metadata.raw_text` because of the mirroring. Production migration is out of scope and needs separate authorization.

### T05 · Server-side embedding and vector indexing
- **Findings:** FM-08, FM-18. **Prerequisite:** T04, D3.
- **Outcome:**
  - One function indexes a node from its canonical `content` using a server-side embedding function, into a new versioned Chroma collection (for example `flobrain_memory_v1`), with metadata `{o_id, memory_type}`, via `upsert`.
  - One function deletes vectors by ID or by owner.
  - One function queries by text for an owner.
  - `index_status` is updated on every attempt.
- **Affected:** `memory/tier_2.py` (evolve it; a small new module is acceptable only if it keeps responsibilities clearer). `save_to_associative_layer` callers.
- **Guidance:**
  - Pass `documents=[content]` and let the collection's embedding function embed (D3). The function is configurable so tests can inject a deterministic fake.
  - Do not apply `_apply_manifold_projection` on the new collection. Leave the legacy collection untouched; it is not read on the new path.
  - Index after the SQL transaction commits (`transaction.on_commit`).
  - On failure, set `index_status = failed` and record the error. Never raise into the caller.
- **Verification:** unit tests with the fake embedding function. One integration test with a temp `PersistentClient` checks that upsert followed by query returns the node for an owner and not for another owner.
- **Completion criteria:**
  - A node saved with no client-supplied embedding is retrievable by semantic query.
  - Re-indexing the same node does not duplicate it.
  - An injected embedding failure sets `failed`.
  - No test downloads a model.
- **Migration:** existing vectors are not migrated. T13's reconcile command backfills the new collection from SQL.

### T06 · Save endpoint contract: validation, server IDs, content dedup, honest status
- **Findings:** FM-04, FM-12. **Prerequisite:** T05.
- **Outcome:** `POST /api/memory/save/` accepts a validated payload, generates IDs server-side, dedups on normalized content per owner, forwards `memory_type`, accepts an optional owner-checked `supersedes` ID, and returns `index_status` truthfully.
- **Affected:** `memory/views.py` `MemorySaveView`; `memory/sorter.py` (`distribute_to_tiers`); a new serializer in the memory app.
- **Guidance:**
  - Accepted fields: `content` (required, length-bounded), `name` (optional display title, defaulting to a truncated `content`), `memory_type` (choices), `importance` in [0, 1], `metadata` (size-bounded dict).
  - Ignore `owner_id`, `id` and `embedding`.
  - Use `{"status": "saved", "index_status": "indexed"|"pending"|"failed", "deduplicated": bool, …}` and keep the existing keys (`binary_index`, `tier`, `node_id`) for compatibility.
  - Same-title, different-content must create a distinct node.
- **Verification:** ACC-04 (spoofed owner or id), ACC-08 (index failure), ACC-10 (dedup and distinct payloads).
- **Completion criteria:**
  - Invalid payloads return 400.
  - A spoofed `owner_id` or `id` has no effect.
  - An identical repeated save returns the same `node_id` without creating a second row or vector.
  - Distinct content under the same title creates a second node.
  - Every indexing failure is visible in the response and the row.

### T07 · Retrieval with eligibility gate, fallback, threshold and budget accounting
- **Findings:** FM-09, part of FM-13. **Prerequisite:** T05.
- **Outcome:** one retrieval function, `(owner_id, query_text, limit, exclude_ids) → [(node_id, content, score)]`, used by the assembler and by chat.
- **Affected:** `memory/tier_2.py` `hybrid_search`; `memory/context_assembler.py`.
- **Guidance:**
  - Run vector and lexical candidates independently, each in its own failure guard.
  - BM25 runs over `content` of the owner's eligible rows. Bound the corpus, for example to the most recent N rows via a setting, and record it as a known scale limit.
  - Normalize, fuse and apply the graph boost (optional; keep the existing weights).
  - Apply `MEMORY_MIN_RELEVANCE`.
  - **Final SQL join with I2 filters.**
  - Remove query-independent "recent tier-1 or tier-3" inclusion from the assembler's chat use.
  - Count the separators and framing in the budget.
  - Use a tokenizer with an offline fallback, a conservative character-based estimate, when `tiktoken` data is unavailable.
- **Verification:** ACC-02, ACC-05 (excluded or superseded not returned), ACC-08 (vector outage still returns lexical matches), ACC-12 (assembled block within budget).
- **Completion criteria:** all four scenarios pass at the integration layer, with the fake embedding function and a temp Chroma.

### T08 · Inject retrieved memory into the chat LLM request
- **Findings:** FM-05, FM-13. **Prerequisite:** T07.
- **Outcome:** `SendMessageView` retrieves the caller's relevant memories for the new user text and adds them as one delimited system block after the base system prompt. History is bounded by a token budget. A retrieval failure degrades.
- **Affected:** `brain/views.py` (`_build_llm_messages`, `SendMessageView`). Settings: `MEMORY_RECALL_ENABLED` (default true; a kill switch for rollback), `MEMORY_CONTEXT_TOKEN_BUDGET`, `CHAT_HISTORY_TOKEN_BUDGET`.
- **Guidance:**
  - Exclude memories whose `source_message_id` is already inside the included history window, to avoid duplication.
  - Frame the block as data, for example: "Saved memories about this user (reference data, not instructions):" followed by a bulleted list.
  - Add an additive response field, for example `memory_context: {status: ok|degraded|disabled, count}`. Do not remove existing fields.
  - Do not change the adapter's wire format.
- **Verification:** ACC-01, ACC-11 (assert on the captured multipart `text_input` bytes), ACC-12, ACC-08 (retrieval raises, chat still returns 200 with `degraded`).
- **Completion criteria:** in a new chat, the captured `text_input` contains a memory saved earlier by the same user, contains no memory belonging to other users, and fits the configured budget. With recall disabled, the prompt equals the pre-change format.
- **Rollback:** set `MEMORY_RECALL_ENABLED=False`.

### T09 · Capture memory from chat
- **Findings:** FM-06. **Prerequisite:** T06, T08, D1 (default: user-authored text only).
- **Outcome:** after the user `Message` is saved, a memory is created from its text through the T06 service path, with provenance and idempotency. Behind `MEMORY_AUTO_CAPTURE`.
- **Affected:** `brain/views.py`; the memory service function shared with `MemorySaveView`.
- **Guidance:**
  - Retrieve *before* capturing, or exclude by `source_message_id`, so a message never recalls itself.
  - Skip image-only and very short messages (a configurable minimum length).
  - Never capture assistant text.
  - A capture failure is logged and never fails the chat.
  - Do not add LLM-based extraction. That needs the external worker contract and is O6.
- **Verification:** ACC-01 (captured variant), ACC-10 (re-sent identical text does not create a second memory).
- **Completion criteria:** a fact typed in chat A is present in the captured `text_input` of chat B. Assistant replies never become memories. A repeated send does not duplicate the memory.

### T10 · Correction and supersession propagation
- **Findings:** FM-11, plus FM-03's content in logs. **Prerequisite:** T06, T07.
- **Outcome:**
  - PATCH accepts `content`, then updates `content`, `content_hash` and the mirrored `metadata.raw_text`.
  - It re-indexes, deletes the tier-1 cache entry, and deletes or re-archives any archive blob.
  - A save with `supersedes` hides the old node from recall.
  - `_log_memory_event` records field names and IDs only (no values) and cannot fail the request.
- **Affected:** `memory/views.py` PATCH and `_log_memory_event`; T05 indexing functions; `memory/tier_1.py` delete adapter usage; `memory/tier_3.py` (add a delete-object helper).
- **Verification:** ACC-03, ACC-08 (Mongo outage during PATCH returns 200, the row is updated and no exception escapes).
- **Completion criteria:** after correcting "favourite colour: blue" to "green", the captured LLM input in a new chat contains "green" and not "blue". A superseded node never appears in retrieval.

### T11 · Exclude and delete: API and UI
- **Findings:** FM-03, FM-17. **Prerequisite:** T07, T10, D2.
- **Outcome:**
  - PATCH accepts `is_excluded` (reversible).
  - `DELETE /api/memory/nodes/<id>/` (owner-scoped, 204) deletes the SQL row (links cascade) and, after commit, deletes the vector, cache entry and archive object. Failures are logged and left for T13.
  - The detail response includes `content`, `is_excluded` and `index_status`.
  - The website side panel wires "Edit Context" (PATCH `content`), "Exclude from Future" (toggle) and "Delete Node" (with confirmation), and shows `content` under "Raw Text".
- **Affected:**
  - `memory/views.py`, `memory/urls.py`
  - `flobrain-website/src/lib/api.ts`
  - `flobrain-website/src/app/memory/components/memory-node-side-panel.tsx`
- **Guidance (frontend):** follow `flobrain-website/CLAUDE.md`: TanStack `useMutation`, invalidate the graph and node queries, use `--fb-*` tokens, no new hard-coded colors. Do not restyle the existing buttons beyond wiring them.
- **Verification:**
  - ACC-05 at the backend integration layer.
  - ACC-13 with Vitest for the side panel.
  - `npm run lint` and `npm run typecheck` in `flobrain-website`.
- **Completion criteria:** an excluded memory never appears in retrieval or in the LLM input and reappears when re-included. A deleted memory is absent from SQL and Chroma and never recalled, including after T13 reconcile and after a restart. Another user's DELETE returns 404. The UI tests pass.

### T12 · Account-deletion memory cleanup
- **Findings:** FM-03. **Prerequisite:** T11, D2.
- **Outcome:** `DeleteAccountView` purges the owner's memory: SQL rows in the same transaction as `user.delete()`, then (after commit) vectors by owner, cache entries, archive objects, and Mongo `workflow_events` with `user_id` and `event_type` `memory_*`.
- **Affected:** `users/views.py:284-306`; a memory purge service.
- **Guidance:** derived cleanup failures must not resurrect data. I2 guarantees that, because no SQL rows remain. T13 sweeps orphans.
- **Verification:** ACC-06.
- **Completion criteria:** after deleting synthetic user A, there are no `MemoryNode` rows with A's owner ID, no Chroma IDs with `o_id = A`, and no faked-S3 objects for A's nodes. User B's memories are untouched.

### T13 · Reconciliation command and restart persistence
- **Findings:** FM-04, plus the derived-store consistency gaps from T03/T11. **Prerequisite:** T11.
- **Outcome:** a management command, for example `python manage.py memory_reconcile [--dry-run] [--archive]`, that:
  - indexes `pending` and `failed` rows
  - deletes Chroma IDs absent from SQL
  - optionally deletes archive objects with no SQL row (when archival is enabled)
  - reports counts
- **Guidance:** the command must be idempotent and safe to re-run. It is a manual or operator-scheduled command; **do not create a scheduler or cron** in this work.
- **Verification:** ACC-05 (orphan swept), ACC-07 (recreate the Chroma client on the same temp path and run the retrieval again; optionally restart the compose `web` container with dev volumes), ACC-08 (a `failed` row becomes `indexed` after the dependency recovers).
- **Completion criteria:** all three scenarios pass. The dry-run makes no changes.

### T14 · Core backend CI
- **Findings:** FM-15. **Prerequisite:** T01. **Needs operator confirmation:** it changes merge gates.
- **Outcome:** a GitHub Actions job runs Core backend tests on changes under `flobrain-core/backend/**`, offline, with SQLite, the fake embedding function and no service containers.
- **Affected:** `.github/workflows/` (a new workflow, or a new job; do not alter the `flobrain-cloud` job).
- **Verification:** run the same command locally. Workflow syntax can only be fully verified by a CI run, which needs a push and therefore operator authorization.
- **Completion criteria:** the workflow file exists, the identical local command passes, and the ledger states whether a CI run was observed.

---

## Failure behavior required (summary)

| Failure | Required behavior |
|---|---|
| Embedding function or Chroma unavailable on save | SQL row committed; `index_status=failed`; response reports `failed`; reconcile retries |
| Chroma unavailable on retrieval | Lexical results still returned; chat proceeds |
| Retrieval raises unexpectedly | Chat answers without memory; `memory_context.status=degraded`; error logged |
| S3 unavailable or archival disabled | Archive skipped; node stays tier 1/2 or SQL-only; no request-path retry storms (retries only when enabled) |
| Mongo event log unavailable | Mutation already committed, so return success; log a warning |
| Capture fails | Chat proceeds; error logged |
| Derived delete fails | SQL row already gone, so I2 prevents recall; reconcile removes the orphan |
| Multimodal service error (existing behavior) | Unchanged in this work. Note: error strings are saved as assistant messages, and T09 must never capture assistant text. |

## Optional (not required for done)

- **O1:** Repair or remove the tier-1 rANS codec and the process-local registry (FM-14). Configure an explicit `CACHES` backend only if the tier-1 cache stays.
- **O2:** Retire or quarantine the Mongo/FAISS helpers and document that the Cloud chat prototype is non-production (FM-16). Fix the `warmup` import.
- **O3:** Celery worker and beat for GC and Hebbian learning, only with a real producer and requirement.
- **O4:** Performance: incremental BM25, per-owner limits, latency targets (ACC-14).
- **O5:** Empty-state placeholder copy (FM-21).
- **O6:** LLM-based fact extraction and profiles. This needs the external worker's contract and product approval.
