# Memory Fix — Progress Ledger

- Started: 2026-11-02T13:21:52Z
- Baseline revision: 67b0153a85468446ccd9a7593625b6297c357b51
- Last revalidated revision: 67b0153a85468446ccd9a7593625b6297c357b51
- Operator settings: max iterations 12 (default), wall clock 8 h from start (default, i.e. until 2026-11-02T21:21:52Z), test env Docker Compose (B1, per README; no dependency installs granted), commit policy default (no commits, branches, pushes or PRs), base branch unset (D4 open), decisions README D1–D3 recommended defaults
- Iterations used: 18 (first run stopped at the default limit of 12; limit then lifted by the operator) · Consecutive no-progress: 0 / 3
- Operator update 2026-11-02T14:50Z: max iterations lifted ("as many as needed until finished"); approved: Docker `node` image + `npm ci`/lint/typecheck/Vitest for flobrain-website (NODE-01), editing `.github/workflows` locally for T14 (T14-auth, no push), migrating the local dev Postgres (DEV-MIGRATE). Wall clock (8 h, until 21:21:52Z) and commit policy (no commits) unchanged.

## Task status
| Task | Status (Not started / In progress / Done / Blocked) | Evidence (ledger iteration #) | Notes |
|---|---|---|---|
| T00 | Done | 1 | check clean; 8 tests: 7 ok, 1 error (predicted) |
| T01 | Done | 2 | `manage.py test memory brain users` offline: 12 tests, 11 ok, 1 baseline error (graph fixture, T02) |
| T02 | Done | 3 | Bob gets 404 on Alice's node (GET/PATCH), connections owner-filtered; 18/18 tests pass |
| T03 | Done | 4 | ACC-09 a–d pass; archive opt-in, key required, tier-3 only, hydration via vault_uri; 23/23 tests |
| T04 | Done | 5 | migration 0002 forward/backfill/reverse executed in Postgres + SQLite test DBs; 28/28 tests |
| T05 | Done | 6 | server-side embedding into `flobrain_memory_v1` (cosine), owner-scoped query, upsert, `index_status`; 34/34 tests; no model download |
| T06 | Done | 7 | serializer 400s, server IDs, normalized-content dedup, owner-checked `supersedes`, truthful `index_status`; 43/43 tests |
| T07 | Done | 8 | `retrieve_memories` (failure-isolated vector + lexical, floor, I2 SQL join) and budgeted assembler; 54/54 tests |
| T08 | Done | 9 | owned, relevant memories reach the captured `text_input` as a delimited block within budget; history bounded; `memory_context`; kill switch; 62/62 tests |
| T09 | Done | 10 | user-authored chat text captured via shared `save_memory` (provenance, dedup, `MEMORY_AUTO_CAPTURE`); recalled in another chat; 69/69 tests |
| T10 | Done | 11 | PATCH `content` → hash/raw_text/vector/cache/archive updated; next chat has green-42 not blue-19; supersession hides old node; event log fields-only, best-effort; 77/77 tests |
| T11 | Done | 12, 13, 15 | backend (it. 12); side panel + ACC-13 (it. 13); deleted memory never recalled after reconcile and a simulated restart (it. 15) |
| T12 | Done | 14 | account deletion purges the owner's rows in the same transaction, then vectors/cache/archive/Mongo `memory_*` events after commit; other users untouched; 89/89 tests |
| T13 | Done | 15 | `memory_reconcile [--dry-run] [--archive]`: re-index pending/failed, resync stale vector metadata, delete orphan vectors / unreferenced archive objects; idempotent; dry-run changes nothing; 96/96 tests |
| T14 | Done | 17 | new `.github/workflows/core-backend-ci.yml` (offline SQLite job: check, makemigrations --check, test memory brain users); identical local command 97/97; no CI run observed (needs a push — not authorized) |

## Acceptance scenarios
| ACC | Status (Not executed / Pass / Fail / Blocked) | Layer | Last iteration | Notes |
|---|---|---|---|---|
| ACC-01 | Pass: (a) explicit save → new chat; (b) fact typed in chat A → captured (`interaction`, provenance) → in chat B's `text_input` block, and not recalled in its own request | Integration (API save + chat send, faked urlopen) | 10 | |
| ACC-02 | Pass (retrieval layer and `text_input`: unrelated question → no block, count 0) | Integration (fake EF, temp Chroma) | 9 | |
| ACC-03 | Pass: (a) PATCH content → SQL content + hash updated, Chroma document updated, next chat `text_input` has green-42 and not blue-19; (b) save with `supersedes` → old ID filtered from retrieval and chat; Mongo payload has no colour values | Integration | 11 | |
| ACC-04 | Pass (rows 1–11) | Integration (JWT, DRF, Postgres + SQLite) | 12 | rows 7–8: Bob's DELETE / PATCH `is_excluded` on Alice's node → 404; row and vector intact |
| ACC-05 | Pass: (a) exclude/re-include; (b) 204, no row, vector gone, never recalled, also after reconcile and a simulated restart; (c) failed Chroma delete → never recalled, orphan removed by reconcile | Integration | 15 | |
| ACC-06 | Pass (no rows, no `o_id` vectors, no faked-S3 keys for Alice; `delete_many` with Alice's `user_id` + `^memory_`; Bob unchanged; wrong password deletes nothing) | Integration (Mongo faked) | 14 | real Mongo regex delete not executed (Mongo faked in tests) |
| ACC-07 | Pass (integration): save → drop module client and Chroma's process-wide system cache → recreate on the same path → same ID recalled. Optional compose-restart E2E not executed | Integration | 15 | |
| ACC-08 | Pass (rows 1–6; row 5: S3 put fails with archival on → 200, node tier 2 not 3, indexed, ERROR logged) | Integration | 16 | row 5 (S3 put fails → not tier 3) still open: node keeps routed tier 3 but stays indexed |
| ACC-09 | Pass (a, b, c, d) | Integration (save endpoint, real temp Chroma, faked boto3) + unit (assembler hydration, faked tiktoken) | 4 | |
| ACC-10 | Pass: (a), (b), (c); (d) second `memory_reconcile` run changes nothing (all counts 0) | Integration | 15 | |
| ACC-11 | Pass (block before the latest user message, memory verbatim, no other user's text, exactly one patched urlopen call) | Integration | 9 | whether the external `/process` service uses `text_input` faithfully is unknown (outside repo) |
| ACC-12 | Pass with the offline counter: memory part ≤ `MEMORY_CONTEXT_TOKEN_BUDGET` (80; 50 leaves no room for any memory after framing), history is the most recent suffix within 200 incl. latest message, total ≤ fixed system line + budgets, fallback counter ≥ word/symbol count. UNEXECUTED: comparison against real tiktoken counts (offline by design) | Unit + integration | 9 | |
| ACC-13 | Pass (6/6: Edit → PATCH content, Exclude/Include → PATCH is_excluded, Delete confirms then DELETE, graph + node queries refreshed, Raw Text shows content, failures shown as alert) | Unit (Vitest in Docker node:20) | 13 | delete removes the node query instead of invalidating it (avoids refetching a 404) |
| ACC-14 | Not executed (optional): needs 2,000 synthetic rows in the dev DB and an operator-approved latency target; a small real-embedder relevance probe was run instead (iteration 18) | E2E (dev) | 18 | see FUP-04 |

## Blockers and decisions
| ID | Description | Needed from | Raised (iteration) | Resolved |
|---|---|---|---|---|
| D4 | Base branch / PR target (`origin/development` lacks the memory app). Only blocks commits/PRs; none are authorized. | Operator | 1 | Yes — 2026-11-02: branch from `main`; committed locally on `fix/memory-lifecycle` (not pushed) |
| T14-auth | Editing `.github/workflows` requires explicit operator authorization. | Operator | 1 | Yes — approved 2026-11-02T14:50Z (local edit only, no push) |
| DEV-MIGRATE | Dev Postgres (`backend_postgres_data`, non-test) is at `memory.0001`; migration `0002_memory_lifecycle_fields` is applied only in test DBs. Until it is applied, the running dev server's memory routes will error on the new columns. Applying it is a migration against a non-test DB → needs operator authorization. Note: the `web` container's startup command runs `migrate`, so restarting the container would apply it automatically; the agent will not restart it. | Operator | 5 | Yes — approved and applied 2026-11-02T14:50Z (`migrate memory` → 0002 OK; 0 memory nodes) |
| INC-01 | I6 incident (iteration 8): the pre-fix run of the new assembler tests constructed the old `LosslessContextAssembler`, whose `__init__` called `tiktoken.encoding_for_model("gpt-4")`; tiktoken downloaded the public `cl100k_base` BPE file from `openaipublic.blob.core.windows.net` into the container's `/tmp/data-gym-cache` (14:08Z). No request data was sent. The cache file was removed; the new assembler defaults to the offline estimator and loads tiktoken only when `MEMORY_TOKENIZER="tiktoken"`. Later runs confirmed no cache reappeared. | Operator (FYI) | 8 | Mitigated |
| NODE-01 | No Node.js/npm on the host, so `npm run lint`, `npm run typecheck` and Vitest cannot run; T11 frontend + ACC-13 are blocked until Node is available (or the operator authorizes another way to run them). | Operator | 12 | Yes — approved 2026-11-02T14:50Z: run in a throwaway Docker `node` container |
| FUP-01 | `memory/mongo_client.py` uses PyMongo's default 30 s server selection; with event logging now working, a Mongo outage delays memory PATCH/DELETE by up to 30 s before the best-effort log gives up. Consider a short `serverSelectionTimeoutMS`. | Engineering | 14 | Open (follow-up) |
| FUP-02 | `requirements.txt` has `chromadb>=0.4.0` unpinned; tests ran on 1.5.9. Pin it so CI and dev resolve the same version. | Engineering | 17 | Open (follow-up) |
| FUP-03 | Website CI does not run Vitest; 41 pre-existing failures in 14 non-memory test files would need fixing first. | Engineering | 17 | Open (follow-up) |
| FUP-04 | Calibrate `MEMORY_MIN_RELEVANCE` (default 0.2) on a labelled set: with the real model a loosely related memory sharing "favourite" scored 0.35 and was recalled (ranked second). | Engineering / product | 18 | Open (follow-up) |
| OPS-01 | Unknown whether any environment archived data under the old all-zero `AES_MASTER_KEY` default. Such archives are now unreadable unless that key is explicitly configured. Not re-encrypted (out of scope). | Operator / ops | 4 | No |

## Iterations

### Iteration 1 — 2026-11-02T13:21:52Z — T00
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51 (HEAD = origin/main = baseline); working tree: only `?? docs/agent-handoff/` (handoff docs, not modified except creating this ledger)
- Baseline revalidation: unchanged; no findings needed rechecking.
- Hypothesis / method: the Docker Compose stack from this checkout runs the labelled suites and reproduces the README baseline (7 ok, 1 error from FM-15 fixture owner). First attempt.
- Failure established: `memory.tests.MemoryAPITestCase.test_graph_maps_api_visualization_fields_to_model_fields` → `KeyError: 'node-primary'` at `memory/tests.py:45` (fixture owner `"system"` vs. owner-scoped graph view, FM-15).
- Files changed: `docs/agent-handoff/memory/PROGRESS_LEDGER.md` (created). No application code changed.
- Commands run (from `flobrain-core/backend`):
  - `docker compose ps` → exit 0; `flobrain_backend_{db,redis,mongodb}` Up (healthy), `flobrain_backend_django` Up.
  - `docker compose exec -T web python manage.py check` → exit 0; "System check identified no issues (0 silenced)."
  - `docker compose exec -T web python -c "import chromadb, django, sys; ..."` → exit 0; chromadb 1.5.9, Django 5.2.18, Python 3.11.18.
  - `docker compose exec -T web python manage.py test memory.tests users.tests --noinput -v 2` → exit 1; "Ran 8 tests … FAILED (errors=1)", test DB `test_flobrain_db` in container Postgres.
    - memory.tests: `test_detail_maps_node_and_connection_fields` ok · `test_graph_maps_api_visualization_fields_to_model_fields` ERROR (KeyError, predicted) · `test_patch_rejects_nonexistent_legacy_model_fields` ok · `test_patch_updates_only_real_model_fields` ok
    - users.tests: all 4 ok.
- Results: PASSED: `manage.py check`; 7 of 8 labelled tests · FAILED: `test_graph_maps_api_visualization_fields_to_model_fields` (expected, FM-15) · BLOCKED: none · UNEXECUTED: `DB_ENGINE=sqlite` variant (optional); frontend checks (no Node.js on host).
- Diff review: no code diff; only the ledger was added.
- Completion criteria: met — commands and outputs recorded; each memory test recorded pass/fail; the predicted failure observed; no application code changed. Note: the 3 passing detail/PATCH tests operate on a node owned by `"system"`, i.e. executed evidence of FM-01.
- Remaining work: T01–T14.
- Blockers: none for T01. D4 open (commits only).
- Decision: continue → T01 (test safety and lazy clients). Next firing scheduled via ScheduleWakeup, 60 s.

### Iteration 2 — 2026-11-02T13:25:17Z — T01
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only `?? docs/agent-handoff/` (this ledger, from iteration 1)
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Hypothesis / method: FM-15/FM-19 — `memory/test_*.py` demo scripts are discovered and run Mongo writes at import; `tier_2` builds a Chroma client and `tier_3` a boto3 client + cipher at import. Moving the scripts out of discovery and building clients on first use (from settings) removes all import-time I/O without changing default behaviour. First attempt.
- Failure established (before the fix, with `memory/testing.py` mixin present): `manage.py test memory.tests.MemoryRuntimeSafetyTestCase` → exit 1, "FAILED (failures=2, errors=1)":
  - `test_memory_app_discovers_only_real_test_modules` FAIL: `['test_crud.py', 'test_embeddings.py', 'test_hy…'] != ['tests.py']`
  - `test_tier_modules_create_no_clients_at_import` FAIL: "Expected 'PersistentClient' to not have been called. Called 1 times."
  - `test_vector_collection_uses_configured_path_and_name` ERROR: `module 'memory.tier_2' has no attribute 'reset_vector_store'`
- Files changed:
  - Moved (plain `mv`, git index untouched, sha256 verified identical): `memory/test_{crud,mongo,knowledge_graph,embeddings,hybrid_retrieval}.py` → `memory/scripts/{crud,mongo,knowledge_graph,embeddings,hybrid_retrieval}_demo.py` (not a package, not matched by `test*.py`).
  - `memory/tier_2.py`: module-level Chroma client/collection → `get_collection()` (lazy, from `MEMORY_VECTOR_DB_PATH` / `MEMORY_VECTOR_COLLECTION`) + `reset_vector_store()`; `query`/`add` call sites use `get_collection()`.
  - `memory/tier_3.py`: module-level boto3 client, cipher and `cold_storage_service` → lazy `get_cold_storage_service()`; env reads and the all-zero default key unchanged (FM-02 is T03).
  - `memory/reclassification.py`: `collection` import → `get_collection()` (only other user of the global).
  - `flobrain/settings.py`: `MEMORY_VECTOR_DB_PATH` (default `/app/vector_db`), `MEMORY_VECTOR_COLLECTION` (default `flobrain_associative_memory`, unchanged), `MEMORY_COLD_STORAGE_ENABLED` (default False; not yet read — T03).
  - New `memory/testing.py`: `IsolatedVectorStoreMixin` (temp Chroma dir + collection name per test class via `override_settings`).
  - New `brain/testing.py`: `capture_multimodal_requests()` patches `brain.llm.multimodal_adapter.urllib.request.urlopen`, parses the multipart body and records the fields (`text_input`, `image`).
  - `memory/tests.py`: new `MemoryRuntimeSafetyTestCase` (3 tests). New `brain/tests.py`: `SendMessageAPITestCase.test_send_forwards_chat_to_faked_multimodal_service` (alice@example.test, "oolong-7731").
- Commands run (from `flobrain-core/backend`):
  - `docker compose exec -T web python manage.py check` → exit 0; no issues.
  - `docker compose exec -T -e MONGO_HOST=10.255.255.1 -e MULTIMODAL_SERVICE_URL=http://10.255.255.1:9 web timeout 300 python manage.py test memory brain users --noinput -v 2` → exit 1; "Ran 12 tests in 0.406s", "FAILED (errors=1)"; only error is `test_graph_maps_api_visualization_fields_to_model_fields` (`KeyError: 'node-primary'`, baseline FM-15 fixture bug, fixed in T02). Whole-app run is safe: unroutable Mongo/multimodal hosts, no hang.
  - Same with `-e DB_ENGINE=sqlite` → exit 1; "Ran 12 tests in 0.245s", "FAILED (errors=1)" (same baseline error).
  - Import probe: `python -c "…patch('chromadb.PersistentClient'), patch('boto3.client'); import memory.tier_2, memory.tier_3, memory.reclassification, memory.context_assembler, memory.views…"` → exit 0; "chroma calls 0 boto3 calls 0".
- Results: PASSED: `manage.py check`; 11/12 tests (3 new safety tests, new brain send test, 3 pre-existing memory tests, 4 users tests) on Postgres and SQLite; import probe · FAILED: graph fixture test (expected baseline, T02) · BLOCKED: none · UNEXECUTED: frontend checks (no website change; no Node.js on host).
- Diff review: default runtime config identical (same path, same collection). Behaviour change limited to timing: a bad `AES_MASTER_KEY` now fails at first archive use (caught → returns False / `{}`) instead of at import. No queries touched, so owner isolation unchanged. No secrets, real data or debug leftovers. `memory/testing.py` and `brain/testing.py` match Django's `test*.py` discovery pattern but contain no tests and no I/O; the discovery test lists them explicitly.
- Completion criteria: met — no `test*.py` module in `memory/` does I/O at import; demo scripts exist under `memory/scripts/`; suite passes offline apart from the baseline graph test.
- Remaining work: T02–T14. `manage.py test memory` (whole app) is now safe to run.
- Blockers: none for T02. D4 open (commits only).
- Decision: continue → T02 (owner-scope node detail and PATCH). Next firing scheduled via ScheduleWakeup, 60 s.

### Iteration 3 — 2026-11-02T13:33:10Z — T02
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1/2 changes (ledger, T01 files) — no user changes.
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Hypothesis / method: FM-01 — `MemoryNodeDetailView.get`/`patch` use `MemoryNode.objects.get(id=pk)` with no owner filter, and connections are serialized unfiltered. Adding `owner_id=str(user.id)` to both lookups and to the link targets/sources closes ACC-04 rows 1–3; graph (row 4) and auth (row 11) already hold. First attempt.
- Failure established: new `memory.tests.MemoryOwnerIsolationTestCase` (alice@example.test / bob@example.test, "oolong-7731" / "teal-4410", links both directions) → exit 1, "Ran 6 tests … FAILED (failures=4)":
  - `test_foreign_node_detail_is_not_found` FAIL `200 != 404`
  - `test_foreign_and_missing_nodes_return_identical_404` FAIL `200 != 404`
  - `test_foreign_node_patch_is_not_found_and_leaves_row_unchanged` FAIL `200 != 404`
  - `test_own_node_connections_exclude_foreign_nodes` FAIL `[{'id': 'node-alice', …}] != []`
  - `test_graph_lists_only_own_nodes_and_links` ok; `test_memory_routes_require_valid_token` ok (no token / malformed token → 401 on graph, detail GET, PATCH, save).
- Files changed:
  - `memory/views.py` `MemoryNodeDetailView`: GET and PATCH look up `id=pk, owner_id=str(user.id)` (foreign and missing IDs both → `{"error": "Node not found"}` 404); outgoing/incoming connections filtered by `target__owner_id` / `source__owner_id` with `select_related`.
  - `memory/tests.py`: `MemoryAPITestCase` fixtures now set `owner_id=str(self.user.id)` (FM-15 fixture bug); new `MemoryOwnerIsolationTestCase` (6 tests).
- Commands run (from `flobrain-core/backend`):
  - `docker compose exec -T web python manage.py check` → exit 0; no issues.
  - `docker compose exec -T -e MONGO_HOST=10.255.255.1 -e MULTIMODAL_SERVICE_URL=http://10.255.255.1:9 web timeout 300 python manage.py test memory brain users --noinput -v 2` → exit 0; "Ran 18 tests in 0.747s", "OK".
  - Same with `-e DB_ENGINE=sqlite` → exit 0; "Ran 18 tests in 0.750s", "OK".
- Results: PASSED: `manage.py check`; all 18 tests (4 MemoryAPITestCase incl. the formerly failing graph test, 6 isolation, 3 runtime safety, 1 brain, 4 users) on Postgres and SQLite · FAILED: none · BLOCKED: none · UNEXECUTED: frontend checks (no website change).
- Diff review: only the two lookups and the two connection querysets changed; graph and save untouched. Every query touched is owner-filtered (I2/I3; owner from `get_user_from_request`). 404 body identical for foreign and missing IDs. PATCH on a foreign node logs nothing to Mongo. No derived stores touched. One blank-line whitespace cleanup inside the edited block. No secrets, real data or debug leftovers.
- Completion criteria: met — Bob gets 404 on Alice's node for GET and PATCH and Alice's row is unchanged; connections exclude foreign nodes; all `memory.tests` pass.
- Acceptance: ACC-04 rows 1, 2, 3, 4, 11 Pass (integration).
- Remaining work: T03–T14.
- Blockers: none for T03. D4 open (commits only).
- Decision: continue → T03 (cold archive opt-in, key required, tier-conditional, URI fix). Next firing scheduled via ScheduleWakeup, 60 s.

### Iteration 4 — 2026-11-02T13:38:09Z — T03
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–3 changes — no user changes.
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Hypothesis / method: FM-07 — `MemorySaveView` calls `migrate_to_cold_storage` for every save, which sets tier 3 and skips Chroma/cache; FM-02 — the archive silently uses an all-zero key; FM-10 — the assembler passes the node, not `metadata.vault_uri`. Gate archival on `tier == 3 and MEMORY_COLD_STORAGE_ENABLED`, require a valid 64-hex key (else log and refuse), index anything not archived, hydrate by `vault_uri` for the caller's own nodes only. First attempt.
- Failure established: new `memory.tests.ColdArchiveSafetyTestCase` (S3 faked at `memory.tier_3.boto3.client` with `FakeS3Client`; real Chroma in a temp dir; tiktoken faked). First run errored on the missing `reset_cold_storage` test hook; after adding only that hook (no behaviour change) → exit 1, "Ran 5 tests … FAILED (failures=7)":
  - (a) high-importance save with archival disabled: `AssertionError: 3 != 1` (forced to tier 3, FM-07)
  - (a') low-importance save with archival disabled: `'vault_uri' unexpectedly found` (archived to fake S3 under the default zero key, FM-02)
  - (c) enabled + valid key: `3 != 1` for importance 0.9
  - (b) enabled + key `""` / 63 zeros / non-hex: `no logs of level ERROR … on memory.tier_3` (3 subtests)
  - (d) hydration: log `'MemoryNode' object has no attribute 'startswith'`, `'oolong-7731' not found in ''` (FM-10)
- Files changed:
  - `flobrain/settings.py`: `MEMORY_COLD_STORAGE_BUCKET` (env `S3_VAULT_BUCKET`, same default) and `MEMORY_COLD_STORAGE_KEY` (env `AES_MASTER_KEY`, default empty — zero-key default removed).
  - `memory/tier_3.py`: `get_cold_storage_service()` returns None when archival is disabled, or (with an ERROR log, no cipher, no boto3 client) when the key is not 64 hex chars; `reset_cold_storage()` test hook; `migrate_to_cold_storage` / `retrieve_from_cold_storage` return False / `{}` when the service is None.
  - `memory/views.py` `MemorySaveView`: archive only if `node.tier_level == 3 and settings.MEMORY_COLD_STORAGE_ENABLED`; index in Chroma whenever not archived (tier 3 with archival off or failing stays indexed); tier-1 buffer unchanged.
  - `memory/context_assembler.py`: hydrate with `node.metadata["vault_uri"]`, and only for tier-3 candidates whose `owner_id` equals the caller.
  - `memory/tier_2.py`: Chroma client built with `Settings(anonymized_telemetry=False)` — found this iteration that chromadb 1.5.9 defaults telemetry to True (PostHog), which violates I6 for tests using a real temp-dir client (and sends usage data from the server). Whether earlier runs actually emitted telemetry was not observed.
  - `memory/testing.py`: `FakeS3Client` (in-memory put/get) and `FakeTokenEncoder` (avoids tiktoken's encoding download — container has no tiktoken cache).
  - `memory/tests.py`: new `ColdArchiveSafetyTestCase` (5 tests, synthetic `TEST_AES_KEY = "ab" * 32`); runtime-safety test now also asserts telemetry is off.
- Commands run (from `flobrain-core/backend`):
  - `docker compose exec -T web sh -c '… tiktoken / onnxruntime …'` → TIKTOKEN_CACHE_DIR empty, no `/tmp/data-gym-cache`, tiktoken 0.14.0, onnxruntime importable.
  - `docker compose exec -T web sh -c '… chromadb.config.Settings().anonymized_telemetry …'` → `True`; PostHog capture present.
  - `docker compose exec -T web timeout 300 python manage.py test memory.tests.ColdArchiveSafetyTestCase --noinput -v 2` (after fix) → exit 0; "Ran 5 tests in 0.827s", "OK".
  - `docker compose exec -T web python manage.py check` → exit 0.
  - `docker compose exec -T -e MONGO_HOST=10.255.255.1 -e MULTIMODAL_SERVICE_URL=http://10.255.255.1:9 web timeout 300 python manage.py test memory brain users --noinput -v 2` → exit 0; "Ran 23 tests in 1.563s", "OK".
  - Same with `-e DB_ENGINE=sqlite` → exit 0; "Ran 23 tests in 0.821s", "OK".
  - `ls /app/vector_db; ls -d /tmp/memory-vector-db-*` → only `chroma.sqlite3` (mtime 13:27:16Z, i.e. written during iteration 2's pre-fix run when tier_2 still created its client at import); no leftover temp dirs. The dev store was not modified this iteration and was left in place.
- Results: PASSED: `manage.py check`; 23/23 tests on Postgres and SQLite (5 new ACC-09 tests) · FAILED: none · BLOCKED: none · UNEXECUTED: FM-07 retry-latency hypothesis not measured directly (no boto3 call is made when archival is off); frontend checks (no website change).
- Diff review: owner isolation — hydration restricted to the caller's own tier-3 nodes; no other query changed. SQL ↔ derived stores — a node is now either archived (tier 3 + `vault_uri`) or indexed in Chroma, never neither due to archival; SQL row is always written. I4 — misconfigured key logs an ERROR and the save still succeeds. `reclassification.task_gc_deep_freeze` now skips nodes while archival is disabled (Celery not running). Known gap left for T06: saving a duplicate of an already-archived node can re-archive it (pre-existing). No secrets (only the synthetic test key), no real data, no debug leftovers.
- Completion criteria: met — high-importance save stays tier 1 and reaches the vector layer; archival disabled → boto3 never called; archival enabled + missing/invalid key → no cipher built, no S3 call, ERROR logged, save succeeds in SQL; hydration of archive-only text via `vault_uri` returns it.
- Acceptance: ACC-09 (a)–(d) Pass.
- Remaining work: T04–T14. Ops follow-up OPS-01 recorded.
- Blockers: none for T04. D4 open (commits only).
- Decision: continue → T04 (authoritative memory schema). Next firing scheduled via ScheduleWakeup, 60 s.

### Iteration 5 — 2026-11-02T13:45:09Z — T04
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–4 changes — no user changes.
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Hypothesis / method: add the lifecycle fields from the plan plus a backfill data migration; verify forward/backfill/reverse with a `MigrationExecutor` test that runs inside Django's throwaway test DB (Postgres and SQLite), so no non-test DB is migrated. First attempt.
- Failure established: new `MemorySchemaTestCase` (4) + `MemorySchemaMigrationTestCase` (1) → exit 1, "Ran 5 tests … FAILED (errors=5)": `MemoryNode() got unexpected keyword arguments: 'content'` / `'source_message_id'`, `'MemoryNode' object has no attribute 'content'`; migration test errored (no `0002`).
- Files changed:
  - `memory/models.py` `MemoryNode`: `content` (TextField, default ""), `is_excluded` (bool, indexed), `superseded_by` (nullable self-FK, SET_NULL, related_name `supersedes`), `source_chat_id` / `source_message_id` (nullable IntegerField, not FKs), `index_status` (`pending`/`indexed`/`failed`, default `pending`, indexed) + constants, `index_error` (TextField); `UniqueConstraint(owner_id, source_message_id)` where `source_message_id IS NOT NULL`. `save()` defaults empty `content` to `metadata.raw_text or name` (same rule as the backfill) and mirrors `content` into `metadata.raw_text` (transition), adding both to `update_fields` when given.
  - New `memory/migrations/0002_memory_lifecycle_fields.py`: generated AddField/AddConstraint ops + `RunPython(backfill_content, noop)` setting `content = metadata.raw_text or name` and `content_hash = sha256(content)`.
  - `memory/tests.py`: new schema + migration tests; the T03 hydration test now clears the SQL copy with a queryset `update(metadata=…, content="")` so its "archive-only" premise still holds under mirroring.
- Commands run (from `flobrain-core/backend`):
  - `docker compose exec -T web python manage.py makemigrations memory --name memory_lifecycle_fields` → created `0002_memory_lifecycle_fields.py` (file write only; no DB).
  - `docker compose exec -T web python manage.py makemigrations --check --dry-run` → exit 0; "No changes detected".
  - `docker compose exec -T web python manage.py check` → exit 0.
  - `docker compose exec -T -e MONGO_HOST=10.255.255.1 -e MULTIMODAL_SERVICE_URL=http://10.255.255.1:9 web timeout 300 python manage.py test memory brain users --noinput -v 2` → exit 0; "Ran 28 tests in 3.316s", "OK" (Postgres test DB `test_flobrain_db`; migration test migrated 0002→0001→0002 there).
  - Same with `-e DB_ENGINE=sqlite` → exit 0; "Ran 28 tests in 2.297s", "OK".
  - `docker compose exec -T web python manage.py showmigrations memory` (read-only on dev DB) → `[X] 0001_initial`, `[ ] 0002_memory_lifecycle_fields`.
- Results: PASSED: makemigrations check; `manage.py check`; 28/28 tests on Postgres and SQLite, incl. forward migration with backfill (raw-text row, name-only row, empty row → content and sha256 hash correct), reverse migration (columns gone, 3 rows intact) · FAILED: none · BLOCKED: applying 0002 to the dev Postgres (non-test DB; needs operator authorization — DEV-MIGRATE) · UNEXECUTED: frontend checks (no website change).
- Diff review: no queries changed, so owner isolation unchanged. Derived stores untouched. `MemoryNode.save()` now always writes `content`/`metadata` alongside any `update_fields` (e.g. PATCH of `name` or tier-3 `migrate_node`); `name` edits do not change `content`. Transitional inconsistency to resolve in T06: `sorter.distribute_to_tiers` still computes `content_hash` from `name`, while backfilled rows hash `content`, so exact-hash dedup can miss on rows where raw text ≠ name (FM-12; T06 switches dedup to content). No secrets, real data or debug leftovers. Working-copy CRLF endings are consistent (autocrlf=true; HEAD stores LF).
- Completion criteria: met — forward and backward migration runs recorded (inside Postgres and SQLite test DBs), backfill test passes, existing tests pass.
- Remaining work: T05–T14. Operator: DEV-MIGRATE.
- Blockers: none for T05 (D3 default: Chroma default embedding function; tests inject a fake). D4 open.
- Decision: continue → T05 (server-side embedding and vector indexing). Next firing scheduled via ScheduleWakeup, 60 s.

### Iteration 6 — 2026-11-02T13:51:09Z — T05
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–5 changes — no user changes.
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Hypothesis / method: FM-08 — the save path only adds client-supplied (projected) vectors with no `documents`, so a save without `embedding` never reaches Chroma. Replace it with `index_node()` that upserts `documents=[content]` into a new versioned, cosine collection whose embedding function is configurable (D3 default: Chroma `DefaultEmbeddingFunction`; tests inject a deterministic fake), plus `delete_vectors()` and `query_owner_vectors()`; index via `transaction.on_commit`. First attempt.
- Failure established: new `memory.tests.MemoryVectorIndexTestCase` (6 tests) → exit 1, "FAILED (failures=1, errors=5)": `test_save_without_client_embedding_is_indexed_and_owner_queryable` FAIL `'pending' != 'indexed'` (FM-08 through the API); the other 5 errored on missing `index_node` / `get_embedding_function`.
- Files changed:
  - `flobrain/settings.py`: `MEMORY_VECTOR_COLLECTION` default → `flobrain_memory_v1` (legacy `flobrain_associative_memory` no longer read or written; left on disk untouched); new `MEMORY_EMBEDDING_FUNCTION` (default `chromadb.utils.embedding_functions.DefaultEmbeddingFunction`).
  - `memory/tier_2.py`: `get_embedding_function()` (import_string from settings); `get_collection()` passes it and `metadata={"hnsw:space": "cosine"}`; new `index_node(node)` (upsert content + `{o_id, memory_type}`, sets `index_status` indexed/failed + `index_error` via queryset `update`, never raises; empty content → failed); `delete_vectors(ids=…, owner_id=…)`; `query_owner_vectors(owner_id, text, n)` → `[(id, cosine distance)]` with `where={"o_id": owner}`. Removed `save_to_associative_layer` (sole caller was the save view) and the now-unused `datetime` import. `_apply_manifold_projection` remains only for legacy `hybrid_search` (T07).
  - `memory/views.py` `MemorySaveView`: client `embedding` ignored; `transaction.on_commit(lambda: index_node(node))` whenever the node is not archived.
  - `memory/testing.py`: `FakeEmbeddingFunction` (256-d hashed bag-of-words, implements Chroma 1.x `name`/`get_config`/`build_from_config`), `FailingEmbeddingFunction`; `IsolatedVectorStoreMixin` now also overrides `MEMORY_EMBEDDING_FUNCTION` and empties the collection in `setUp` (Chroma is not rolled back with the test DB).
  - `memory/tests.py`: new `MemoryVectorIndexTestCase`; T03 `_save` runs on-commit callbacks and no longer sends `embedding`; T01 runtime-safety test checks collection `name` kwarg; test classes using the mixin chain `super().setUp()`.
- Commands run (from `flobrain-core/backend`):
  - Pre-check: `python -c "…EmbeddingFunction protocol…"` → Chroma 1.5.9 EF protocol has `name`, `get_config`, `build_from_config`, `is_legacy`, …; `ls ~/.cache/chroma` → absent (no model cached).
  - `docker compose exec -T web python manage.py check` → exit 0; `makemigrations --check --dry-run` → exit 0 "No changes detected".
  - First full run → exit 1, 34 tests, 1 FAIL `test_reindexing_same_node_does_not_duplicate` `2 != 1`. Diagnosis: leftover vector from an earlier test in the same class (shared temp Chroma dir); the test passed alone (`… test memory.tests.MemoryVectorIndexTestCase.test_reindexing_same_node_does_not_duplicate` → "Ran 1 test … OK"). Changed method: mixin empties the collection per test and test classes call `super().setUp()`.
  - `docker compose exec -T -e MONGO_HOST=10.255.255.1 -e MULTIMODAL_SERVICE_URL=http://10.255.255.1:9 web timeout 300 python manage.py test memory brain users --noinput -v 2` → exit 0; "Ran 34 tests in 7.435s", "OK".
  - Same with `-e DB_ENGINE=sqlite` → exit 0; "Ran 34 tests in 5.215s", "OK".
  - `ls ~/.cache/chroma; ls -d /tmp/memory-vector-db-*; stat /app/vector_db/chroma.sqlite3` → no model cache, no leftover temp dirs, dev store mtime still 13:27:16Z.
- Results: PASSED: check; makemigrations check; 34/34 tests on Postgres and SQLite · FAILED: none (the intermediate isolation failure was fixed) · BLOCKED: none · UNEXECUTED: real `DefaultEmbeddingFunction` (needs one model download in the dev container — D3; not done in tests by design); frontend checks (no website change).
- Diff review: owner isolation — `query_owner_vectors` always filters `o_id`; metadata `o_id` comes from the SQL row's `owner_id` (server-forced). I2 SQL re-join is T07's job. SQL ↔ Chroma: upsert by node ID (idempotent); `index_status` reflects the last attempt; failures never raise (I4). Indexing runs synchronously after commit (no worker); in dev the first real embed downloads the ONNX model. Legacy `hybrid_search` now queries the new collection with projected 1536-d vectors — dimension mismatch is caught and returns `[]`; it is not on the chat path and is replaced in T07. No secrets, real data or debug leftovers.
- Completion criteria: met — save without client embedding is retrievable by semantic query (owner only); re-indexing does not duplicate; injected embedding failure sets `failed` with the error; no test downloads a model.
- Acceptance: ACC-01/02 remain Not executed (need T06–T08).
- Remaining work: T06–T14. Operator: DEV-MIGRATE.
- Blockers: none for T06. D4 open.
- Decision: continue → T06 (save endpoint contract). Next firing scheduled via ScheduleWakeup, 60 s.

### Iteration 7 — 2026-11-02T13:59:09Z — T06
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–6 changes — no user changes.
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Hypothesis / method: FM-04/FM-12 — the save view trusts raw `request.data` (client `id` becomes the primary key), dedups by title hash + title MinHash (merging different facts), ignores `memory_type`, and reports success without index state. Add a DRF serializer, always generate IDs, dedup exactly on normalized content per owner, forward `content`/`memory_type`, owner-check `supersedes`, and index synchronously after the sorter's commit so the response can report `index_status`. First attempt.
- Failure established: new `memory.tests.MemorySaveContractTestCase` (9 tests, alice/bob) → exit 1, "Ran 9 tests … FAILED (failures=14, errors=2)": all 8 invalid payloads `200 != 400`; spoofed `id` honoured; foreign `supersedes` not rejected; own `supersedes` not linked; same title + different content merged; `memory_type` not forwarded; `KeyError: 'deduplicated'` / `'index_status'`; index failure not surfaced. (Logged `TypeError: 'NoneType' object is not subscriptable` from the old unvalidated path; gone after the fix.)
- Files changed:
  - New `memory/serializers.py`: `MemorySaveSerializer` — `content` (required, ≤10000), `name` (optional, ≤255), `memory_type` (model choices, default `chunk`), `importance` [0,1] (default 0.5), `metadata` (dict, ≤4096 bytes JSON), `supersedes` (optional). Unknown keys (`owner_id`, `id`, `embedding`, …) are dropped.
  - `memory/sorter.py`: `normalize_content`, `content_hash_for` (sha256 of whitespace-collapsed lowercase content), `_default_title` (≤80 chars, ellipsis); `distribute_to_tiers` always uses `uuid4` IDs, requires `owner_id`/`content`, dedups on `(owner_id, content_hash, superseded_by IS NULL)` only (title MinHash merge loop removed; signature still stored, now over content), session-link lookup owner-scoped, creates with `content` and `memory_type`, sets `node.deduplicated`.
  - `memory/views.py` `MemorySaveView`: validates (400 with details); `supersedes` must be the caller's node (else 404, nothing created) and is linked via `superseded_by` after save; new nodes → archive (T03 rules) / `index_node()` called directly after the sorter's committed transaction / tier-1 buffer; duplicates skip archive and buffer and only re-index if not already indexed and not archived; response adds `index_status` and `deduplicated`, keeps `status`, `binary_index`, `tier`, `node_id`. Unused `transaction` import removed.
  - `memory/migrations/0002_memory_lifecycle_fields.py`: backfill hash now uses the same normalization (migration only ever applied in test DBs; dev DB still at 0001).
  - `memory/tests.py`: new contract tests; earlier tests send `content`; migration test uses `content_hash_for`.
- Commands run (from `flobrain-core/backend`):
  - `docker compose exec -T web python manage.py check` → exit 0; `makemigrations --check --dry-run` → exit 0 "No changes detected".
  - `docker compose exec -T -e MONGO_HOST=10.255.255.1 -e MULTIMODAL_SERVICE_URL=http://10.255.255.1:9 web timeout 300 python manage.py test memory brain users --noinput -v 2` → exit 0; "Ran 43 tests in 4.872s", "OK".
  - Same with `-e DB_ENGINE=sqlite` → exit 0; "Ran 43 tests in 3.454s", "OK".
  - `… test memory.tests.MemorySaveContractTestCase … | grep -B6 TypeError` → no matches (old log noise gone).
- Results: PASSED: check; makemigrations check; 43/43 on Postgres and SQLite · FAILED: none · BLOCKED: none · UNEXECUTED: frontend checks (frontend does not call save; no website change).
- Diff review: owner isolation — owner only from the token; `supersedes` existence check and update both filter `owner_id`; dedup lookup and session-link lookup owner-scoped. SQL ↔ Chroma: duplicate saves never create a second row or vector (upsert by ID); `index_status` returned is the row's value after the attempt. I4: index failure → 200 with `index_status="failed"`. Two whitespace-only lines in the edited sorter block. `_calculate_jaccard_similarity` is now unused (left in place). No secrets, real data or debug leftovers.
- Completion criteria: met — invalid payloads 400; spoofed `owner_id`/`id` no effect; identical (normalized) repeat returns the same `node_id`, one row, one vector; distinct content under the same title → second node; indexing failure visible in response and row.
- Acceptance: ACC-04 rows 5–6 Pass; ACC-08 row 1 (save part) Pass; ACC-10 (a), (b) Pass.
- Remaining work: T07–T14. Open notes for later tasks: dedup currently matches excluded nodes (decide in T11 whether a re-save un-excludes); ACC-08 row 5 (S3 put failure leaves routed tier 3, though indexed).
- Blockers: none for T07. Operator: DEV-MIGRATE, OPS-01, D4.
- Decision: continue → T07 (retrieval with eligibility gate). Next firing scheduled via ScheduleWakeup, 60 s.

### Iteration 8 — 2026-11-02T14:06:09Z — T07
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–7 changes — no user changes.
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Hypothesis / method: FM-09/FM-13 — `hybrid_search` runs vector + BM25 in one `try` (a Chroma error skips BM25), has no floor, scores titles, max-normalizes (so the best unrelated hit scores 1.0) and does no I2 join; the assembler adds recent tier-1/tier-3 nodes regardless of the query, ignores separators in the budget and needs tiktoken data. Replace with `retrieve_memories()` (independent, failure-isolated vector + lexical scores on absolute scales, 0.6/0.4 fusion, `MEMORY_MIN_RELEVANCE`, final SQL join on owner/not excluded/not superseded/exists) and a budgeted assembler built only on retrieval. First attempt.
- Diagnostic (executed): `python -c "from rank_bm25 import BM25Okapi …"` → 1-doc corpus, query `tea` → `[-0.2747]`; 2-doc corpus → `tea` `[0, 0]`, `synthetic` `[-0.039, -0.042]`. BM25Okapi is unusable with a relevance floor on the 1–2 document corpora typical of one user, so the lexical score is an IDF-weighted query-term coverage in [0, 1] (stopwords ignored, corpus bounded by `MEMORY_LEXICAL_CORPUS_LIMIT`). Deviation from the plan's "BM25" wording, recorded here.
- Failure established: new `MemoryRetrievalTestCase` (8) + `MemoryContextAssemblyTestCase` (3) → exit 1, "Ran 11 tests … FAILED (failures=1, errors=10)": `test_query_independent_recent_nodes_are_not_included` FAIL `('Synthetic bike lock code note', ['node-recent'], 6) != ('', [], 0)` (FM-09 recency inclusion through the real assembler); the others errored on missing `retrieve_memories` / `_lexical_scores` / `count_tokens`. That run triggered INC-01 (tiktoken download) — see Blockers table.
- Files changed:
  - `memory/tier_2.py`: removed `hybrid_search` and `_apply_manifold_projection` (FM-18; no remaining users) and the unused `BM25Okapi` import; added `_STOPWORDS`, `_query_terms`, `_eligible_rows` (I2 filter), `_lexical_scores`, `retrieve_memories(owner_id, query_text, limit, exclude_ids) → [(id, content, score)]`; `AsyncAssociativeMemoryManager.process_background_rerank` now delegates to it. Graph (Hebbian) boost not carried over (optional per plan; link expansion was unscoped).
  - `memory/context_assembler.py`: rewritten — `count_tokens()` (offline estimate `max(ceil(utf8_bytes/3), words+symbols)` by default; tiktoken `cl100k_base` only when `MEMORY_TOKENIZER="tiktoken"`, falling back on load failure), `render_memory_block()` (`<user_memories>` … `</user_memories>`, `- ` lines), `LosslessContextAssembler.assemble_context()` uses only `retrieve_memories`, adds memories while the whole rendered block fits the budget (skip, not truncate), returns `(block, ids, count_tokens(block))`; archive-only rows hydrated by `vault_uri` for the caller's own node. Tier-1 cache reads and query-independent tier-1/tier-3 inclusion removed.
  - `flobrain/settings.py`: `MEMORY_RETRIEVAL_LIMIT` (5), `MEMORY_MIN_RELEVANCE` (0.2), `MEMORY_LEXICAL_CORPUS_LIMIT` (500), `MEMORY_CONTEXT_TOKEN_BUDGET` (800), `MEMORY_TOKENIZER` ("estimate").
  - `memory/tests.py`: new retrieval + assembly tests; ACC-09 (d) hydration test now patches `retrieve_memories` (recency inclusion is gone). `memory/testing.py`: removed now-unused `FakeTokenEncoder`.
- Commands run (from `flobrain-core/backend`):
  - `docker compose exec -T web sh -c 'ls -la /tmp/data-gym-cache …'` → one 1.68 MB file dated 14:08 (INC-01); `rm -f …/9b5ad71b… && rmdir /tmp/data-gym-cache` → removed.
  - `docker compose exec -T web python manage.py check` → exit 0.
  - `docker compose exec -T -e MONGO_HOST=10.255.255.1 -e MULTIMODAL_SERVICE_URL=http://10.255.255.1:9 web timeout 300 python manage.py test memory brain users --noinput -v 2` → exit 0; "Ran 54 tests in 6.601s", "OK".
  - Same with `-e DB_ENGINE=sqlite` → exit 0; "Ran 54 tests in 6.136s", "OK".
  - `ls /tmp/data-gym-cache ~/.cache/chroma` after both runs → both absent (no tiktoken or ONNX download).
- Results: PASSED: check; 54/54 on Postgres and SQLite (ACC-02 retrieval, ACC-05 eligibility, ACC-08 row 2 retrieval, ACC-12 assembler, ACC-04 row 10) · FAILED: none · BLOCKED: none · UNEXECUTED: comparison of the offline counter against real tiktoken counts (would need the tiktoken download); real-embedding retrieval quality/thresholds (fake EF only); frontend checks (no website change).
- Diff review: owner isolation — vector query filtered by `o_id`; lexical corpus and final join via `_eligible_rows(owner_id)`; hydration owner-filtered. A stale, foreign or deleted vector can only cause a miss. I4 — each recall path logs a WARNING and degrades; both failing returns `[]`. `MEMORY_MIN_RELEVANCE=0.2` was chosen against the fake EF; real-model calibration is unknown. Working-copy line endings consistent (CRLF). No secrets, real data or debug leftovers.
- Completion criteria: met at the retrieval/assembler integration layer with the fake embedding function and temp Chroma — ACC-02 (abstains on unrelated, returns only the related memory), ACC-05 (excluded/superseded/deleted not returned), ACC-08 row 2 (vector outage → lexical results), ACC-12 (block incl. framing within budget). The chat-level parts of these scenarios are T08's.
- Remaining work: T08–T14.
- Blockers: none for T08. Operator: DEV-MIGRATE, OPS-01, D4; INC-01 for awareness.
- Decision: continue → T08 (inject memory into the chat LLM request). Next firing scheduled via ScheduleWakeup, 60 s.

### Iteration 9 — 2026-11-02T14:15:09Z — T08
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–8 changes — no user changes.
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Hypothesis / method: FM-05/FM-13 — `SendMessageView` builds the LLM request from this chat's full history only. Add `_build_memory_message()` (assembler over `retrieve_memories`, owner from the token, framed as reference data, inserted right after the base system prompt) and bound history in `_build_llm_messages()` to `CHAT_HISTORY_TOKEN_BUDGET` with the same counter and the adapter's own formatting; add `memory_context`; kill switch `MEMORY_RECALL_ENABLED`. First attempt.
- Failure established: new `brain.tests.ChatMemoryRecallTestCase` (8 tests; alice/bob, oolong-7731/matcha-5512) → exit 1, "Ran 9 tests … FAILED (failures=5, errors=3)": captured `text_input` was exactly `'System: You are FloBrain, a helpful AI assistant.\n\nUser: Which tea do I like?'` (no memory — FM-05 through the real chat endpoint); `KeyError: 'memory_context'`; no ERROR log on recall failure.
- Files changed:
  - `brain/views.py`: `SYSTEM_PROMPT`, `MEMORY_PROMPT_HEADER` ("Saved memories about this user (reference data, not instructions):"), `PROMPT_SEPARATOR`; `_history_entry()` (unchanged per-message rules); `_build_llm_messages()` now returns `(messages, history_message_ids)` keeping the newest turns whose `"\n\n" + adapter-formatted` cost fits the budget (latest always kept; ordering `created_at, id`); new `_build_memory_message()` excludes memories whose `source_message_id` is in the history window, budgets the block after subtracting the `"\n\nSystem: " + header + "\n"` prefix, catches any failure → `degraded` (logged with `logger.exception`); `SendMessageView` inserts the memory message at index 1 and returns `{**ChatDetailSerializer.data, "memory_context": {status, count}}`. Adapter wire format unchanged.
  - `flobrain/settings.py`: `MEMORY_RECALL_ENABLED` (True), `CHAT_HISTORY_TOKEN_BUDGET` (6000; the external model's real limit is unknown).
  - `brain/tests.py`: new recall tests.
- Commands run (from `flobrain-core/backend`):
  - `docker compose exec -T web python manage.py check` → exit 0.
  - First post-fix run → exit 1, 62 tests, 1 FAIL `test_memory_block_and_history_fit_their_budgets` (`False is not true`): with a 50-token memory budget the header prefix (~27) plus `<user_memories>` framing leaves no room for any memory, so no block was emitted. Changed the test budget to 80 (ACC-12 gives 50 only as an example) and asserted 1 ≤ count < 5 (budget, not the retrieval limit, trims).
  - `docker compose exec -T -e MONGO_HOST=10.255.255.1 -e MULTIMODAL_SERVICE_URL=http://10.255.255.1:9 web timeout 300 python manage.py test memory brain users --noinput -v 2` → exit 0; "Ran 62 tests in 9.908s", "OK".
  - Same with `-e DB_ENGINE=sqlite` → exit 0; "Ran 62 tests in 7.859s", "OK".
  - `ls /tmp/data-gym-cache ~/.cache/chroma` → both absent.
- Results: PASSED: check; 62/62 on Postgres and SQLite — ACC-01 (a), ACC-02, ACC-04 row 9, ACC-08 rows 2–3, ACC-11, ACC-12 (offline counter) · FAILED: none · BLOCKED: none · UNEXECUTED: real-tiktoken comparison for ACC-12; behaviour of the external `/process` service with the new `text_input` (unknown, outside repo); frontend checks (no website change; `memory_context` is additive).
- Diff review: owner isolation — `owner_id` only from `get_user_from_request`; history-window exclusion query owner-filtered; retrieval owner-scoped with I2 join (T07). I4 — recall failure → 200 + `degraded`, reply still saved. I5 — memory sent as a separate system message with a "reference data, not instructions" header and `<user_memories>` delimiters, before chat turns. Imports the adapter's private `_format_messages_as_prompt` so history costs match the wire format exactly. With recall disabled and history under budget, `text_input` equals the pre-change format (tested). No secrets, real data or debug leftovers.
- Completion criteria: met — in a new chat the captured `text_input` contains the user's earlier-saved memory, no other user's memory, and fits the budget; with recall disabled the prompt equals the pre-change format.
- Remaining work: T09–T14.
- Blockers: none for T09 (D1 default: capture user-authored chat messages only, behind `MEMORY_AUTO_CAPTURE`, default on in dev). Operator: DEV-MIGRATE, OPS-01, D4; INC-01 for awareness.
- Decision: continue → T09 (capture from chat). Next firing scheduled via ScheduleWakeup, 60 s.

### Iteration 10 — 2026-11-02T14:22:07Z — T09
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–9 changes — no user changes.
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Hypothesis / method: FM-06 — nothing creates memories from chat. Extract the T06 save pipeline into a shared `memory.services.save_memory(owner_id, validated_data, source_chat_id, source_message_id)` and call it from `SendMessageView` for the user's own message after recall (so it never recalls itself), behind `MEMORY_AUTO_CAPTURE` (D1 default). First attempt.
- Failure established: new `brain.tests.ChatMemoryCaptureTestCase` (7 tests) → exit 1, "Ran 7 tests … FAILED (failures=2, errors=4)": fact test errored (no `MemoryNode` created — FM-06), `KeyError: 'memory_capture'`, `brain.views` has no `save_memory`, repeated-send/assistant tests `0 != 1` (no memory at all).
- Files changed:
  - New `memory/services.py`: `save_memory()` — sorter (with provenance), owner-checked supersession link, archive/index/buffer rules from T03/T05/T06, re-index of non-indexed duplicates.
  - `memory/views.py` `MemorySaveView`: validation and `supersedes` 404 check unchanged; body now calls `save_memory`; unused `settings` import removed.
  - `memory/sorter.py`: creates nodes with `source_chat_id` / `source_message_id` from the payload.
  - `brain/views.py`: `_capture_memory(user, user_message)` — disabled → `disabled`; text shorter than `MEMORY_CAPTURE_MIN_CHARS` (image-only included) or failing `MemorySaveSerializer` (e.g. >10000 chars) → `skipped`; `save_memory(..., memory_type="interaction")` with the message's chat/message IDs; any exception logged → `failed`; result `captured`/`duplicate` + `node_id`. `SendMessageView` keeps the created user `Message`, captures after the assistant reply is saved, and returns additive `memory_capture`. Assistant text is never passed to capture.
  - `flobrain/settings.py`: `MEMORY_AUTO_CAPTURE` (default = `DEBUG`, i.e. on in dev, off unless set elsewhere), `MEMORY_CAPTURE_MIN_CHARS` (20).
  - `brain/tests.py`: new capture tests; `ChatMemoryRecallTestCase` pins `MEMORY_AUTO_CAPTURE=False`; the original `SendMessageAPITestCase` (no isolated vector store) pins capture and recall off so it can never touch `/app/vector_db` or load the real embedder (the dev `.env` sets `DEBUG=True`).
- Commands run (from `flobrain-core/backend`):
  - `docker compose exec -T web python manage.py check` → exit 0.
  - `docker compose exec -T -e MONGO_HOST=10.255.255.1 -e MULTIMODAL_SERVICE_URL=http://10.255.255.1:9 web timeout 300 python manage.py test memory brain users --noinput -v 2` → exit 0; "Ran 69 tests in 12.051s", "OK".
  - Same with `-e DB_ENGINE=sqlite` → exit 0; "Ran 69 tests in 9.921s", "OK".
  - `ls /tmp/data-gym-cache ~/.cache/chroma; stat /app/vector_db/chroma.sqlite3` → no caches; dev store mtime still 13:27:16Z.
- Results: PASSED: check; 69/69 on Postgres and SQLite — ACC-01 (b), ACC-10 (c), ACC-08 row 6 · FAILED: none · BLOCKED: none · UNEXECUTED: frontend checks (additive response field only); live dev-server behaviour (dev DB unmigrated — DEV-MIGRATE).
- Diff review: owner from the token only; provenance from the server-created `Message`; dedup per owner (a re-sent fact maps to the existing node; an excluded node stays excluded). I4 — capture and recall failures never fail chat. Note for the running dev server: with the dev DB still at `memory.0001`, recall and capture both raise on the missing columns and are caught (`degraded` / `failed`), so chat keeps working; after DEV-MIGRATE the first capture will download the ONNX embedding model (allowed by D3 in dev). No secrets, real data or debug leftovers.
- Completion criteria: met — a fact typed in chat A is in chat B's captured `text_input`; assistant replies never become memories; a repeated send does not duplicate the memory.
- Remaining work: T10–T14. Only 2 iterations remain under the default limit, so T12–T14 will not be reached in this run.
- Blockers: none for T10. Operator: DEV-MIGRATE, OPS-01, D4; INC-01 for awareness.
- Decision: continue → T10 (correction and supersession propagation). Next firing scheduled via ScheduleWakeup, 60 s.

### Iteration 11 — 2026-11-02T14:28:08Z — T10
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–10 changes — no user changes.
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Hypothesis / method: FM-11 (+ FM-03 log content) — PATCH cannot change `content`, so corrections never reach SQL, Chroma, cache or archive, and `_log_memory_event` stores before/after values and can raise after the commit. Accept validated `content`, recompute the hash, propagate to the derived stores, and make the event log field-names-only and best-effort. Supersession already hides old nodes (T06/T07) — verified at chat level. First attempt.
- Failure established: new `memory.tests.MemoryCorrectionTestCase` (8 tests; blue-19 → green-42; Mongo patched at `memory.views.mongo_db`) → exit 1, "Ran 8 tests … FAILED (failures=5, errors=1)": content PATCH `400 != 200`; next chat `text_input` still contained `- Synthetic favourite colour is blue-19`; Mongo payload contained `before`/`after` values; Mongo outage not handled; no cache-evict adapter. The supersession-in-chat test and the invalid-content test passed before the change (expected: T06/T07 behaviour; content not editable).
- Files changed:
  - `memory/views.py`: PATCH accepts `content` (string, non-blank, ≤ `MAX_CONTENT_CHARS`, else 400); on change sets `content_hash = content_hash_for(content)` (model `save()` mirrors `metadata.raw_text`), then `_propagate_content_change()` — evict tier-1 cache, delete the old archive blob and clear `vault_uri`, re-archive if tier 3 with archival enabled, otherwise `index_node()` (upsert; records `index_status`). `_log_memory_event` wraps `insert_one` in try/except (WARNING) and PATCH logs `{"memory_node_id", "fields": [...]}` only.
  - `memory/tier_1.py`: `evict_from_active_buffer(node_id)` — unconditional cache delete + eviction-tracker removal; never raises.
  - `memory/tier_3.py`: `S3StorageBackend.delete_object(uri)` (same URI guard and retry policy as get) and `delete_from_cold_storage(vault_uri)` (False + WARNING when archival disabled/misconfigured; never raises).
  - `memory/testing.py`: `FakeS3Client.delete_object`. `memory/tests.py`: new correction tests.
- Commands run (from `flobrain-core/backend`):
  - `docker compose exec -T web python manage.py check` → exit 0.
  - `docker compose exec -T -e MONGO_HOST=10.255.255.1 -e MULTIMODAL_SERVICE_URL=http://10.255.255.1:9 web timeout 300 python manage.py test memory brain users --noinput -v 2` → exit 0; "Ran 77 tests in 12.879s", "OK".
  - Same with `-e DB_ENGINE=sqlite` → exit 0; "Ran 77 tests in 13.362s", "OK".
  - `ls /tmp/data-gym-cache ~/.cache/chroma; stat /app/vector_db/chroma.sqlite3` → no caches; dev store unchanged (13:27:16Z). Line endings of edited files consistent (CRLF).
- Results: PASSED: check; 77/77 on Postgres and SQLite — ACC-03 (a)(b), ACC-08 row 4 · FAILED: none · BLOCKED: none · UNEXECUTED: frontend (no website change in this task; UI is T11).
- Diff review: owner isolation — PATCH lookup already owner-scoped (T02); archive delete/rewrite only for that node. SQL ↔ derived: SQL committed first; vector upserted (or re-archived); cache evicted; old blob deleted. If archival is disabled after a node was archived, the old blob cannot be deleted (logged; orphan for T13/ops). PATCH of `memory_type` alone does not refresh vector metadata (retrieval relies on `o_id` + SQL join, so no leak; T13 can resync). The PATCH response does not echo `index_status`; failures are recorded on the row. Other PATCH fields (`name`, `memory_type`, `relevance`) remain unvalidated as before (pre-existing). No secrets, real data or debug leftovers.
- Completion criteria: met — after correcting blue → green the next chat's captured `text_input` contains green-42 and not blue-19; a superseded node never appears in retrieval or chat.
- Remaining work: T11–T14. One iteration remains under the default limit (12).
- Blockers: none for T11 (D2 default). Operator: DEV-MIGRATE, OPS-01, D4; INC-01 for awareness.
- Decision: continue → T11 (exclude and delete: API + UI). Next firing scheduled via ScheduleWakeup, 60 s. T11 includes frontend work; Node.js is not installed on the host, so `npm run lint` / `typecheck` / Vitest will be BLOCKED unless they can run elsewhere.

### Iteration 12 — 2026-11-02T14:34:12Z — T11 (backend part)
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–11 changes — no user changes.
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Hypothesis / method: FM-03/FM-17 — there is no delete route, no exclusion control, and the detail API omits `content`. Add `is_excluded` to PATCH (strict boolean), `DELETE /api/memory/nodes/<id>/` (owner-scoped; SQL delete, then on commit delete vector, evict cache, delete archive blob), and return `content`/`is_excluded`/`index_status` from detail and PATCH. Node.js is not installed (`which node npm` → not found), so the side-panel wiring and ACC-13 cannot be verified this run; frontend deliberately not changed rather than shipped unverified.
- Failure established: new `memory.tests.MemoryExcludeDeleteTestCase` (8 tests) → exit 1, "Ran 8 tests … FAILED (failures=5, errors=2)": DELETE `405 != 204` / `405 != 404` / `405 != 401`; PATCH `is_excluded` `400 != 200`; detail `KeyError: 'content'`; no `delete_vectors` in views.
- Files changed:
  - `memory/views.py` `MemoryNodeDetailView`: detail and PATCH responses add `content`, `is_excluded`, `index_status`; PATCH accepts `is_excluded` (non-bool → 400); new `delete()` — 401 without auth, 404 for foreign/missing, deletes the row (links cascade, `superseded_by` pointers SET_NULL), then `transaction.on_commit` → `delete_vectors(ids=[id])`, `evict_from_active_buffer(id)`, `delete_from_cold_storage(vault_uri)` (each logs and never raises), logs `memory_deleted` with the ID only, returns 204.
  - `memory/tests.py`: new exclude/delete tests.
- Commands run (from `flobrain-core/backend`):
  - `which node npm` (host) → neither found.
  - `docker compose exec -T web python manage.py check` → exit 0; `makemigrations --check --dry-run` → exit 0 "No changes detected".
  - `docker compose exec -T -e MONGO_HOST=10.255.255.1 -e MULTIMODAL_SERVICE_URL=http://10.255.255.1:9 web timeout 300 python manage.py test memory brain users --noinput -v 2` → exit 0; "Ran 85 tests in 13.855s", "OK".
  - Same with `-e DB_ENGINE=sqlite` → exit 0; "Ran 85 tests in 11.950s", "OK".
  - `ls /tmp/data-gym-cache ~/.cache/chroma; stat /app/vector_db/chroma.sqlite3` → no caches; dev store unchanged (13:27:16Z).
- Results: PASSED: check; makemigrations check; 85/85 on Postgres and SQLite — ACC-04 rows 7–8, ACC-05 (a), (b)/(c) except reconcile/restart · FAILED: none · BLOCKED: `npm run lint`, `npm run typecheck`, Vitest / ACC-13 (no Node.js) · UNEXECUTED: side-panel frontend changes (not written); reconcile/restart parts of ACC-05 (T13).
- Diff review: owner isolation — DELETE and PATCH look up `id + owner_id`; foreign → 404 with no side effects (verified row and vector intact). SQL ↔ derived: SQL deleted first; derived deletions after commit; a failed vector delete leaves an orphan that recall can never return (I2, tested) and that T13 must remove. I4 — derived-store failures never fail the request. D2 — exclusion reversible; captured memories survive chat deletion (no FK to chats). No secrets, real data or debug leftovers.
- Completion criteria: partially met — exclusion hides and re-inclusion restores (met); deleted memory absent from SQL and Chroma and never recalled (met, except "after T13 reconcile and after a restart" — T13 not done); another user's DELETE → 404 (met); UI tests pass (BLOCKED — no Node.js; frontend not implemented). Status: In progress.
- Remaining work: T11 frontend (side panel + `api.ts` + Vitest), T12, T13, T14.
- Blockers: NODE-01 (Node.js), DEV-MIGRATE, OPS-01, D4, T14-auth; INC-01 for awareness.
- Decision: STOP — "limit reached" (12/12 iterations). Loop ended with ScheduleWakeup stop.

## Final report (2026-11-02T14:37Z)
- Stop reason: limit reached (12 / 12 iterations; wall clock 1 h 15 m of 8 h).
- Tasks Done: T00–T10. In progress: T11 (backend done; frontend blocked by NODE-01). Not started: T12, T13, T14 (T14 also needs operator authorization).
- Backend suite: `manage.py test memory brain users` — 85/85 OK on Postgres and SQLite, offline (unroutable Mongo/multimodal hosts), no model or tokenizer downloads after INC-01 was mitigated.
- Nothing committed, branched or pushed (commit policy default; D4 open).

### Iteration 13 — 2026-11-02T14:50:07Z — T11 (frontend part) + DEV-MIGRATE
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–12 changes — no user changes.
- Baseline revalidation: unchanged (HEAD = origin/main = baseline).
- Operator approvals used: DEV-MIGRATE, NODE-01 (Docker node), T14-auth (not yet used).
- DEV-MIGRATE: `docker compose exec -T web python manage.py migrate memory --plan` → 0002 ops listed; `… migrate memory` → "Applying memory.0002_memory_lifecycle_fields... OK", exit 0; `showmigrations memory` → `[X] 0002`; dev `MemoryNode` count 0.
- Hypothesis / method: FM-17 + T11 UI — the side panel shows `name` as "Raw Text" and its three action buttons have no handlers. Add `api.updateMemoryNode` / `api.deleteMemoryNode` and detail types; wire the buttons with TanStack `useMutation`; show `content`. Frontend checks run in a throwaway `node:20` container with `node_modules` in the Docker volume `fb_web_node_modules` and `npm ci --ignore-scripts` (no package install scripts run; no host install).
- Environment checks: website root files `tsc`, `flobrain-website@0.1.0` (empty) and `Node.nvmrc` ("20") are tracked in git — harmless, left alone. Image `node:20` → Node v20.20.2, npm 10.8.2; `npm ci --ignore-scripts --no-audit --no-fund` → exit 0.
- Frontend baseline (before any change): `npm run typecheck` → 0; `npm run lint` → 0; `npx vitest run` → "Test Files 14 failed | 30 passed (44)", "Tests 41 failed | 255 passed (296)" — pre-existing failures in 14 non-memory files (brain sidebar, dashboard ×4, error, home ×2, payment, pricing, profile ×3, navbar), e.g. profile-settings expects `red-600` but the button uses `bg-[var(--fb-brain-error)]`. Recorded as baseline, not fixed (out of scope).
- Failure established: new `src/app/memory/components/memory-node-side-panel.test.tsx` (6 tests) → "Tests 6 failed (6)": content not found under Raw Text (title shown instead — FM-17), no "Include in Future", buttons inert.
- Files changed:
  - `flobrain-website/src/lib/api.ts`: `updateMemoryNode(id, body)` (PATCH), `deleteMemoryNode(id)` (DELETE); `MemoryNodeApi` gains optional `content`, `is_excluded`, `index_status`; new `MemoryNodeUpdate` type.
  - `flobrain-website/src/app/memory/components/memory-node-side-panel.tsx`: Raw Text shows `content`; "Edit Context" opens an inline textarea (Save/Cancel) → PATCH `content`; "Exclude from Future" ↔ "Include in Future" → PATCH `is_excluded`; "Delete Node" → inline confirmation → DELETE, closes the panel; update success invalidates `["memory","graph"]` and `["memory","node",id]`; delete invalidates the graph and removes the node query (no 404 refetch); failures shown in a `role="alert"` line; actions disabled for placeholder nodes, before detail loads and while pending; editor/confirmation state keyed to the node id. Existing buttons keep their styling.
  - `flobrain-website/src/app/globals.css`: new token `--fb-memory-btn-text: #ffffff` in all three memory theme blocks (used by the new Save button, so no new inline colour). An intermediate double insertion (a shell command that errored after its `sed` had run) was found and removed; final diff is exactly 3 added lines.
  - New `flobrain-website/src/app/memory/components/memory-node-side-panel.test.tsx` (own `QueryClientProvider`, `@/lib/api` mocked).
- Commands run (in `flobrain-website`, via `docker run --rm -v <website>:/app -v fb_web_node_modules:/app/node_modules -w /app node:20 …`):
  - `npx vitest run src/app/memory/components/memory-node-side-panel.test.tsx` → "Tests 6 passed (6)".
  - `npm run typecheck` → exit 0 (an earlier run failed TS2345 on the test fixture's `index_status: string`; fixed by typing the fixture as `ApiResult<MemoryNodeDetailApi>`).
  - `npm run lint` → exit 0.
  - `npx vitest run` → exit 1; "Tests 41 failed | 261 passed (302)", "Test Files 14 failed | 31 passed (45)"; `diff` of failing-file lists vs. baseline → identical (no new failures; +6 passing).
- Results: PASSED: dev migration; ACC-13 (6/6); typecheck; lint; no new Vitest failures · FAILED: 41 pre-existing Vitest tests in 14 unrelated files (baseline) · BLOCKED: none · UNEXECUTED: manual check in a browser (the Next dev server would need Node on the host or a Dockerised dev server plus a signed-in test account and real embeddings — not attempted; behaviour covered by the component tests and the backend API tests).
- Diff review: no backend change this iteration. Frontend follows `flobrain-website/CLAUDE.md` (TanStack mutations, `--fb-*` tokens, existing `"use client"` file). Docker created an empty `flobrain-website/node_modules` mount point on the host (gitignored). No secrets or real data.
- Completion criteria (T11): UI tests pass — met; exclusion and deletion behaviour — met (it. 12); "never recalled after T13 reconcile and after a restart" — pending T13. Status stays In progress.
- Next: T12 (account-deletion cleanup), then T13, then close T11, then T14.

### Iteration 14 — 2026-11-02T15:05Z — T12
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–13 changes — no user changes.
- Baseline revalidation: unchanged.
- Hypothesis / method: FM-03 — `DeleteAccountView` only calls `user.delete()`; `MemoryNode.owner_id` is a string, so nothing cascades. Add `memory.services.purge_owner_memories(owner_id)` that deletes the SQL rows (inside the account-deletion transaction) and returns an after-commit cleanup for vectors (by IDs and `o_id`), tier-1 cache, archive blobs and Mongo `memory_*` events. First attempt.
- Diagnostic found on the way: `python -c "bson.encode({'user_id': uuid.uuid4()})"` (pymongo 4.19.0) → `ValueError: cannot encode native uuid.UUID with UuidRepresentation.UNSPECIFIED`. `_log_memory_event` passed `user.id` (a UUID), so no memory event could ever be written (silently caught since T10). Fixed by logging `user_id=str(user.id)`; T12 deletes events by that string.
- Failure established: new `memory.tests.AccountDeletionMemoryCleanupTestCase` (4 tests; Alice/Bob each with an indexed and an archived memory; S3 faked; Mongo `MagicMock`). After adding only the `mongo_db` import to `services.py`: "Ran 4 tests … FAILED (failures=2, errors=1)": `test_account_deletion_purges_only_that_owners_memory` → `True is not false` (Alice's rows survive account deletion — FM-03); `test_memory_events_store_the_user_id_as_a_string` → `UUID('…') != '…'`; `delete_vectors` missing from services. (The wrong-password test passed, as expected.)
- Files changed:
  - `memory/services.py`: `purge_owner_memories(owner_id) -> cleanup` (collects IDs and `vault_uri`s, deletes rows; cleanup: `delete_vectors(ids, owner_id)`, `evict_from_active_buffer` per ID, `delete_from_cold_storage` per blob, `mongo_db.workflow_events.delete_many({"user_id": owner_id, "event_type": {"$regex": "^memory_"}})` with a WARNING on failure); module logger.
  - `users/views.py` `DeleteAccountView`: inside `transaction.atomic()` → purge rows, `user.delete()`, `transaction.on_commit(cleanup)`.
  - `memory/views.py`: memory events log `user_id=str(user.id)` (PATCH, DELETE).
  - `memory/tests.py`: new class; fast `MD5PasswordHasher` override for its synthetic passwords (PBKDF2 measured at ~0.8 s per hash in the container).
- Commands run (from `flobrain-core/backend`):
  - `docker compose exec -T web python manage.py check` → exit 0.
  - `… test memory brain users --noinput -v 2` (unroutable Mongo/multimodal) → exit 0; "Ran 89 tests in 55.696s", "OK". Investigated the slowdown: per-class timings (largest: this class 11.5 s from PBKDF2, brain 7.9 s); hypothesis "unpatched Mongo logging now waits 30 s" ruled out (no class near 30 s). `docker stats` shows the local `flobrain_backend_mongodb` container at ~89% CPU on its own (tests never contact it) — environmental load, left alone.
  - After the hasher override: Postgres → exit 0, "Ran 89 tests in 25.169s", "OK"; SQLite → exit 0, "Ran 89 tests in 40.539s", "OK".
  - `ls /tmp/data-gym-cache ~/.cache/chroma; stat /app/vector_db/chroma.sqlite3` → no caches; dev store unchanged.
- Results: PASSED: check; 89/89 on Postgres and SQLite — ACC-06 · FAILED: none · BLOCKED: none · UNEXECUTED: Mongo regex deletion against a real Mongo (faked here).
- Diff review: the purge only touches rows `owner_id == <deleting user>`; Bob's rows, vectors and blobs verified untouched. SQL rows and the user are deleted atomically; derived cleanup runs after commit and never raises; an orphan cannot be recalled (I2, tested with failing vector/blob deletes) and is for T13. Captured memories had no chat FK, and account deletion removes them anyway (D2). Production note: with `user_id` now encodable, a real Mongo outage makes a memory PATCH/DELETE wait for PyMongo's default 30 s server selection before the best-effort log gives up (previously it failed instantly on the encoding bug). Lowering `serverSelectionTimeoutMS` in `memory/mongo_client.py` would bound this — recorded as follow-up FUP-01, not changed (outside T12's scope).
- Completion criteria: met — after deleting Alice: no rows, no `o_id=Alice` vectors, no faked-S3 objects for her nodes; Bob untouched.
- Next: T13 (reconcile command and restart persistence), then close T11, then T14.

### Iteration 15 — 2026-11-02T15:21Z — T13 (and T11 closure)
- Revision at start: 67b0153a85468446ccd9a7593625b6297c357b51; working tree: only iteration-1–14 changes — no user changes.
- Baseline revalidation: unchanged.
- Hypothesis / method: FM-04 + derived-store gaps — nothing repairs `failed`/`pending` indexing, orphan vectors left by failed deletes, stale vector metadata (T10 note) or unreferenced archive blobs. Add `memory.services.reconcile_memory(dry_run, archive)` and a thin `memory_reconcile` management command (JSON counts). No scheduler or cron created.
- Failure established: new `memory.tests.MemoryReconcileTestCase` (7 tests) → "Ran 7 tests … FAILED (errors=6)": `KeyError: 'memory_reconcile'` (code path did not exist). `test_memory_survives_a_process_restart` passed before any change — Chroma persistence across a simulated restart (module client reset + `SharedSystemClient.clear_system_cache()`) already worked.
- Files changed:
  - `memory/services.py`: `reconcile_memory()` — re-index pending/failed rows without `vault_uri` (counts `reindexed` / `reindex_failed`); pages through Chroma (`limit`/`offset`, batch 500) deleting IDs with no SQL row (`orphan_vectors_deleted`) and re-indexing rows whose vector metadata ≠ `{o_id, memory_type}` from SQL (`resynced`); with `archive`, lists archive objects and deletes those no row's `vault_uri` references (`orphan_archive_objects_deleted`; `archive` = skipped/checked/unavailable); `dry_run` counts only.
  - New `memory/management/commands/memory_reconcile.py` (`--dry-run`, `--archive`).
  - `memory/tier_3.py`: `S3StorageBackend.list_uris()` (follows `NextContinuationToken`) and `list_archived_uris()` adapter (None when disabled/failed).
  - `memory/testing.py`: `FakeS3Client.list_objects_v2` with a 2-key page size so pagination is exercised. `memory/tests.py`: new tests; imports `io`, `json`, `call_command`.
- Commands run (from `flobrain-core/backend`):
  - `… test memory.tests.MemoryReconcileTestCase -v 2` → 7/7 ok.
  - `docker compose exec -T web python manage.py memory_reconcile --help` → usage with `--dry-run`, `--archive` (not run against the dev stores).
  - `manage.py check` → exit 0; `makemigrations --check --dry-run` → exit 0 "No changes detected".
  - Full: Postgres → exit 0, "Ran 96 tests in 13.002s", "OK"; SQLite → exit 0, "Ran 96 tests in 11.461s", "OK".
  - No tiktoken/ONNX caches; dev vector store unchanged.
- Results: PASSED: 96/96 on both DBs — ACC-05 (complete), ACC-07 (integration), ACC-08 row 1 (complete), ACC-10 (d) · FAILED: none · BLOCKED: none · UNEXECUTED: optional compose-restart E2E (ACC-07); running `memory_reconcile` against the dev stores (0 memory rows there).
- Diff review: reconcile only deletes vectors whose ID has no SQL row, and only archive objects no row references (I1); re-index uses the SQL row's own `owner_id`. Pagination advances past retained vectors only. Idempotence and dry-run verified. Known scale limit: archive sweep loads all referenced `vault_uri`s into memory.
- Completion criteria: T13 met (ACC-05 sweep, ACC-07 restart, ACC-08 row 1; dry-run makes no changes). T11's remaining criterion (never recalled after reconcile and restart) met by `test_orphan_vector_from_a_failed_delete_is_swept_and_stays_gone_after_restart` → T11 Done.
- Next: ACC-08 row 5 (S3 put failure must not leave the node marked tier 3), then T14.

### Iteration 16 — 2026-11-02T15:26Z — ACC-08 row 5 (T03 follow-up)
- Revision at start: baseline; working tree: only iteration-1–15 changes.
- Hypothesis / method: the sorter stores low-importance saves as tier 3 before archival is attempted; if the S3 upload fails, the node keeps claiming tier 3 although it is only in the vector index. Downgrade to tier 2 when archival was attempted and failed (archival disabled keeps T03's rule: tier 3 stays in SQL and is indexed).
- Failure established: new `ColdArchiveSafetyTestCase.test_failed_archive_upload_keeps_the_node_out_of_tier_3` (fake S3 `put_object` raises a non-network `RuntimeError`, so the retry policy does not sleep) → FAIL `3 == 3`.
- Files changed: `memory/services.py` (`save_memory`: on failed archival set `tier_level = 2` and save); `memory/tests.py` (new test).
- Commands run: full suite Postgres → exit 0, "Ran 97 tests in 23.623s", "OK"; SQLite → exit 0, "Ran 97 tests in 21.007s", "OK".
- Results: PASSED: 97/97, ACC-08 row 5 · FAILED/BLOCKED: none.
- Diff review: affects only the archival-enabled failure path; response `tier` now matches the row. No other behaviour change.
- Next: T14 (approved).

### Iteration 17 — 2026-11-02T15:30Z — T14 (operator-approved)
- Revision at start: baseline; working tree: only iteration-1–16 changes.
- Hypothesis / method: FM-15 — `.github/workflows/backend-ci.yml` runs only for `flobrain-cloud/**`, so nothing gates `flobrain-core/backend`. Add a separate workflow (the Cloud job is untouched) that runs offline on SQLite with unroutable Mongo/multimodal hosts, no service containers.
- Failure established: by inspection — no workflow references `flobrain-core/backend` (`.github/workflows`: `backend-ci.yml` → `flobrain-cloud/**`, `website-ci.yml` → `flobrain-website/**`, `vercel-deploy.yml`).
- Files changed: new `.github/workflows/core-backend-ci.yml` — triggers on push/PR to `main`/`development` touching `flobrain-core/backend/**` or the workflow; Python 3.11 with pip cache keyed on `requirements.txt`; env `DB_ENGINE=sqlite`, `DEBUG=False`, CI-only non-secret `SECRET_KEY`, `MONGO_HOST=10.255.255.1`, `MULTIMODAL_SERVICE_URL=http://10.255.255.1:9`, `MEMORY_AUTO_CAPTURE=False`, `MEMORY_TOKENIZER=estimate`, `ANONYMIZED_TELEMETRY=False`; steps: checkout, setup-python, `pip install -r requirements.txt`, `manage.py check`, `manage.py makemigrations --check --dry-run`, `manage.py test memory brain users --noinput`.
- Commands run:
  - YAML parse in the web container (`yaml.safe_load`) → jobs `['test']`, 6 steps as above.
  - The workflow's commands with the same env, in the web container: `check` → exit 0; `makemigrations --check --dry-run` → exit 0 "No changes detected"; `test memory brain users --noinput` → exit 0, "Ran 97 tests in 25.201s", "OK".
- Results: PASSED: local equivalent of the CI job · BLOCKED: an actual GitHub Actions run (requires a push; not authorized under the commit policy) · UNEXECUTED: `pip install -r requirements.txt` on a clean runner (the container's preinstalled environment was used; `chromadb>=0.4.0` is unpinned, so CI may resolve a newer Chroma than the 1.5.9 tested here — FUP-02).
- Diff review: new file only; no secrets (CI key is a labelled placeholder); `backend-ci.yml` and `website-ci.yml` unchanged. Website Vitest is still not in CI (41 pre-existing failures would fail it) — FUP-03.
- Completion criteria: met — workflow exists, identical local command passes, ledger states no CI run was observed.
- Next: optional real-embedder threshold probe (D3 permits the one-time model download in the dev container), then final verification.

### Iteration 18 — 2026-11-02T15:31Z — real-embedder relevance probe (diagnostic) and final verification
- Revision at start: baseline; working tree: only iteration-1–17 changes.
- Method: in the dev web container, score ACC-01/ACC-02-style query/memory pairs with Chroma's real `DefaultEmbeddingFunction` (all-MiniLM-L6-v2) and the production lexical scorer, fused 0.6/0.4 as in `retrieve_memories`. D3 permits the one-time model download in the dev container (79.3 MB archive; `/root/.cache/chroma` now 167 MB, in the container filesystem). No DB or vector-store writes.
- Observed (fused score; threshold 0.2): "Which tea do I like?" → tea 0.58, colour 0.18, bike 0.00 (only tea recalled); "What is my favourite colour?" → colour 0.80, tea 0.35, bike 0.04 (colour first, tea also recalled); "Summarize … whales" → max 0.13 (abstains); "What's the weather like in Paris tomorrow?" → max 0.10 (abstains).
- Conclusion: with real embeddings the default recalls related memories and abstains on unrelated ones; a loosely related memory sharing a salient word can pass 0.2 (ranked below the right one). Default left unchanged (3-memory sample); FUP-04 recorded.
- Final verification (no code changes since iteration 16 apart from the T14 workflow): backend 97/97 on Postgres (it. 16) and on SQLite with the CI environment (it. 17); frontend typecheck 0, lint 0, side-panel Vitest 6/6, no new Vitest failures vs. baseline (it. 13).

## Final report (second run) — 2026-11-02T15:33Z
- Stop reason: **complete** — T00–T14 Done; ACC-01 … ACC-13 Pass (ACC-12 with the offline token counter; its real-tiktoken comparison not executed by design); ACC-14 optional, not executed (reason recorded).
- Iterations: 18 in total (12 in the first run, 6 after the operator lifted the limit). Wall clock 2 h 11 m of 8 h.
- Backend: `manage.py test memory brain users` 97/97 on Postgres and SQLite, offline. Frontend: typecheck/lint clean; 6 new Vitest tests pass; 41 pre-existing failures in 14 unrelated files unchanged.
- Dev environment: dev Postgres migrated to `memory.0002` (approved); real embedding model cached in the dev container.
- Nothing committed, branched or pushed (D4 still open). No CI run observed.
- Open follow-ups: FUP-01 … FUP-04, OPS-01 (zero-key archives in other environments), INC-01 (mitigated).

## Commits (operator decision D4: branch from `main`) — 2026-11-02
- Branch `fix/memory-lifecycle` created from `main` (`67b0153a`); not pushed, no PR.
- `376995f4` fix(memory): owner-scoped memory lifecycle with recall in chat — 24 files under `flobrain-core/backend` (demo scripts recorded as renames).
- `f16bb737` feat(website): wire memory side-panel actions — 4 files.
- `3c53bc63` ci: add Core backend workflow — `.github/workflows/core-backend-ci.yml`.
- Not committed: `docs/agent-handoff/` (untracked before this work started; includes this ledger).
- The committed tree equals the tested working tree (backend 97/97 on Postgres and SQLite; frontend typecheck/lint clean, side-panel Vitest 6/6).
