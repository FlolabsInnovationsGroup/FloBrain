# Acceptance and Test Plan

These are proposed acceptance criteria, derived from N3's audit criteria and the brief. They are **not** approved product requirements (see [CURRENT_STATE_AND_FINDINGS.md §3](CURRENT_STATE_AND_FINDINGS.md#3-requirements-status)). All data is synthetic. Use users such as `alice@example.test` and `bob@example.test` and facts such as "My synthetic favourite tea is oolong-7731". Never use real conversations or production data.

## Evidence layers

| Layer | What it proves | What it does not prove |
|---|---|---|
| **Unit** | Logic of one function with collaborators faked | Persistence, isolation through HTTP, external services |
| **Integration** (primary layer for done) | Django test client, real test database (SQLite or Postgres), real Chroma `PersistentClient` in a temp directory with a deterministic fake embedding function, the real `MultimodalLLMAdapter` with `urllib.request.urlopen` patched to capture the exact multipart body, faked boto3 client, patched Mongo logging | Real embedding quality, real S3, the external model's behavior |
| **E2E (dev)** | Compose stack, restart behavior, real Chroma volume, real default embedding model | Production behavior. Requires B1 plus operator approval of any external call. |

Mock-only success is never accepted as proof of persistence, isolation or end-to-end memory behavior.

**Status values:** *Not executed* (proposed), *Pass*, *Fail*, or *Blocked (reason)*. At review time (2026-11-02, `67b0153a`) **every scenario is Not executed**.

## Existing tests and commands

All of these are confirmed from the repository. Only `check` and `test memory.tests users.tests` were executed: on 2026-11-02, in the Docker `web` container at `67b0153a`. Result: check clean; 8 tests ran, 7 ok, 1 error (`test_graph_maps_api_visualization_fields_to_model_fields`, `KeyError`).

| Command | Source | Notes |
|---|---|---|
| `docker compose up --build`, then `docker compose exec web python manage.py <cmd>` (from `flobrain-core/backend`) | `flobrain-core/backend/README.md` | Needs Docker running and a `.env` (`docker-compose.yml` uses `env_file: .env`, and none is in the repo) |
| `docker compose exec web python manage.py check` | N4 §6.1 (reported pass on modified local code) | — |
| `docker compose exec web python manage.py test brain memory` | N4 §6.2 | **Do not use before T01.** It imports `memory/test_*.py` demo scripts that write to MongoDB. |
| `memory/tests.py`, 4 tests | repo | `test_graph_maps_api_visualization_fields_to_model_fields` is predicted to fail on main because of fixture owner `"system"` (unexecuted) |
| `users/tests.py` | repo | Regression for T12 |
| `npm test` (Vitest), `npm run lint`, `npm run typecheck` (from `flobrain-website`) | `flobrain-website/package.json` | No Node.js or `node_modules` on the review machine. N3 observed 34 pass / 10 fail (dashboard provider fixture). |
| `black --check .`, `ruff check .`, `mypy .`, `pytest` | `.github/workflows/backend-ci.yml` | **Only for `flobrain-cloud`**, not Core |

## Proposed commands (unexecuted; confirm in T00)

Chosen environment (2026-11-02): Docker Compose. Run these from `flobrain-core/backend` with Docker Desktop running and the dev `.env` described in the README.

```bash
docker compose up -d --build
docker compose exec web python manage.py check
docker compose exec web python manage.py test memory.tests users.tests --noinput   # T00 baseline (labels only)
docker compose exec web python manage.py test memory brain users --noinput        # after T01 makes discovery safe
docker compose exec web python manage.py makemigrations --check --dry-run         # T04
docker compose exec web python manage.py memory_reconcile --dry-run               # T13 (new command)
docker compose restart web                                                        # ACC-07 E2E restart check
```

---

## Scenarios

### ACC-01 · Save or capture a fact, recall it in another conversation
- **Setup:** Alice and Bob. Alice has chat A and a new empty chat B.
- **Action:**
  - (a) *Explicit:* Alice `POST /api/memory/save/` with `content="My synthetic favourite tea is oolong-7731"`, then sends "Which tea do I like?" in chat B.
  - (b) *Captured (T09):* Alice sends "My synthetic favourite tea is oolong-7731" in chat A, then asks in chat B.
- **Assertions:**
  - The captured multipart `text_input` for the chat-B request contains `oolong-7731` inside the memory block.
  - Chat B's own history does not contain it.
  - The response has `memory_context.status == "ok"` and `count >= 1`.
- **Layer:** Integration. **Dependencies:** T05–T08 for (a), plus T09 for (b). **Status:** Not executed. Current code fails by inspection (FM-05).

### ACC-02 · Unrelated memories are excluded
- **Setup:** Alice has "oolong-7731 tea preference" and "synthetic bike-lock code note" saved.
- **Action:** in a new chat, Alice asks "Summarize the plot of a synthetic novel about whales."
- **Assertions:** neither memory appears in `text_input`. With `MEMORY_MIN_RELEVANCE` set, retrieval returns `[]` for a query with zero lexical overlap and fake-embedding similarity below the threshold. A related query returns only the tea memory.
- **Layer:** Integration (fake embedding function with known similarities). **Dependencies:** T07, T08. **Status:** Not executed. N3 Hist-exec `retrieval_abstains_unrelated` failed on the old assembler.

### ACC-03 · Correcting a fact suppresses the outdated value
- **Setup:** Alice's memory says "synthetic favourite colour is blue-19".
- **Actions:**
  - (a) PATCH `content="synthetic favourite colour is green-42"`.
  - (b) Alternatively, save the new fact with `supersedes=<old id>`.
- **Assertions:**
  - The SQL `content` and `content_hash` are updated.
  - A Chroma query for "colour" returns that ID with new text, or the superseded ID is filtered.
  - The next chat's `text_input` contains `green-42` and not `blue-19`.
  - The Mongo event payload contains no colour values.
- **Layer:** Integration. **Dependencies:** T10. **Status:** Not executed. Fails today by inspection (FM-11).

### ACC-04 · No cross-user access through any operation
| # | Operation (as Bob, targeting Alice's data) | Expected |
|---|---|---|
| 1 | `GET /api/memory/nodes/<alice_id>/` | 404, no Alice data in the body |
| 2 | `PATCH /api/memory/nodes/<alice_id>/` | 404, Alice's row unchanged |
| 3 | `GET` on Bob's own node that has a link to Alice's node | Connections exclude Alice's node |
| 4 | `GET /api/memory/graph/` | Only Bob's nodes and links |
| 5 | `POST /api/memory/save/` with `owner_id=<alice>` and/or `id=<alice_id>` | Saved under Bob with a server-generated ID; Alice's row untouched |
| 6 | Save with `supersedes=<alice_id>` | 400 or 404; Alice's node not superseded |
| 7 | `DELETE /api/memory/nodes/<alice_id>/` | 404; Alice's row, vector and archive intact |
| 8 | PATCH `is_excluded` on Alice's node | 404 |
| 9 | Bob chats "Which tea do I like?" | Bob's `text_input` contains no Alice memory |
| 10 | Retrieval function called with Bob's `owner_id` while Chroma holds Alice's vectors | No Alice IDs returned, after the I2 join |
| 11 | No token / malformed token on every memory route | 401 |
- **Layer:** Integration through the real JWT path (`users.jwt_utils.make_access_token`, as in the existing tests). **Dependencies:** rows 1–4 and 11 need T02; rows 5–6 need T06; rows 7–8 need T11; rows 9–10 need T07/T08. **Status:** Not executed. Rows 1–3 fail today by inspection (FM-01); N3 Hist-exec failed rows 1–2.

### ACC-05 · Excluded or deleted memory never returns
- **Setup:** Alice has a memory M that is recalled for "tea".
- **Actions:**
  - (a) PATCH `is_excluded=true`, ask again, then PATCH `is_excluded=false` and ask again.
  - (b) `DELETE` M, ask again, run `memory_reconcile`, recreate the Chroma client on the same path, and ask again.
  - (c) Make the Chroma delete fail during `DELETE`.
- **Assertions:**
  - (a) Absent from `text_input` while excluded; present after re-inclusion.
  - (b) 204; no SQL row; the Chroma ID is gone after reconcile; never in `text_input`.
  - (c) Still never recalled (I2), and the orphan is removed by reconcile.
- **Layer:** Integration. **Dependencies:** T11, T13. **Status:** Not executed. No delete or exclude exists today (FM-03).

### ACC-06 · Account deletion cleans up memory
- **Setup:** Alice and Bob each have memories (SQL, Chroma, faked archive objects, Mongo `memory_*` events patched to an in-memory fake).
- **Action:** Alice calls the account-deletion endpoint with her password.
- **Assertions:**
  - No `MemoryNode` with Alice's owner ID.
  - No Chroma entries with `o_id=alice`.
  - No faked-S3 keys for Alice's nodes.
  - Alice's `memory_*` events are removed.
  - Bob's data is unchanged.
- **Layer:** Integration. **Dependencies:** T12, D2. **Status:** Not executed. Fails today by inspection (`users/views.py:304`, string owner).

### ACC-07 · Persistence across restarts
- **Integration:** save, then discard the module-level Chroma client and collection (simulating a process restart), recreate them on the same temp path, then retrieve. Expected: same IDs returned. LocMem cache contents are not required (I1).
- **E2E (optional, dev only):** using compose with dev volumes, save, `docker compose restart web`, then recall in a new chat. Chroma lives in the bind-mounted `flobrain-core/backend/vector_db/` (gitignored).
- **Dependencies:** T05, T13. **Status:** Not executed. N4 lists this as pending.

### ACC-08 · Dependency failures and partial writes
| # | Injected failure | Expected |
|---|---|---|
| 1 | Embedding function raises on save | 200 with `index_status="failed"`; SQL row exists; reconcile later sets `indexed` |
| 2 | Chroma `query` raises during chat | Lexical results still used; chat 200 |
| 3 | The retrieval function raises during chat | Chat 200; `memory_context.status="degraded"`; prompt has no memory block |
| 4 | Mongo `insert_one` raises during PATCH | 200; row updated; no exception escapes |
| 5 | S3 `put_object` raises with archival enabled | Save 200; node not marked tier 3; error logged |
| 6 | Capture raises in `SendMessageView` | Chat 200; assistant reply saved |
- **Layer:** Unit and integration. **Dependencies:** T03, T06, T07, T08, T09, T10, T13. **Status:** Not executed. Rows 1, 4 and 5 currently produce false success or partial state (FM-04, N3 Hist-exec).

### ACC-09 · Cold archive safety and routing
- **Assertions:**
  - (a) Archival disabled (default): saving with `importance=0.9` gives tier 1 and a vector; the faked boto3 client is never called.
  - (b) Archival enabled and `AES_MASTER_KEY` missing or invalid: no cipher, no S3 call, an error is logged, the save succeeds.
  - (c) Archival enabled with a valid test key and `importance=0.1`: the node is archived to the faked S3 with `vault_uri` set; it is not routed to tier 3 when importance is high.
  - (d) A node whose text exists only in the faked archive is hydrated through `vault_uri`.
- **Layer:** Unit and integration. **Dependencies:** T03. **Status:** Not executed. (a) fails today when S3 works (FM-07); (d) fails today (FM-10).

### ACC-10 · Duplicate and retried requests
- **Assertions:**
  - (a) An identical `POST /save/` twice gives the same `node_id`, one SQL row and one Chroma entry.
  - (b) The same title with different content gives two nodes.
  - (c) The same user text sent twice in chat produces one captured memory (content dedup), and the unique `(owner_id, source_message_id)` constraint holds.
  - (d) `memory_reconcile` run twice: the second run changes nothing.
- **Layer:** Integration. **Dependencies:** T06, T09, T13. **Status:** Not executed. (b) fails today (FM-12).

### ACC-11 · Memory reaches the actual LLM input
- **Setup:** patch `urllib.request.urlopen` as used in `brain.llm.multimodal_adapter` to capture the `Request` and return a canned JSON `{"result": "ok", "model": "fake", "total_tokens": 1}`. Set `MULTIMODAL_SERVICE_URL` to a non-routable test value.
- **Assertions:**
  - The decoded multipart field `text_input` contains the delimited memory block before the user's latest message.
  - The block contains the expected memory text verbatim.
  - The block contains no other user's text.
  - Exactly one network call is attempted, and it goes to the patched function.
- **Layer:** Integration. This is the strongest repository-level proof. Whether the external `/process` service uses `text_input` faithfully is **unknown** and outside the repo. **Dependencies:** T08. **Status:** Not executed. N3 Hist-exec showed the prompt lacked recall.

### ACC-12 · Final context-budget enforcement
- **Setup:** `MEMORY_CONTEXT_TOKEN_BUDGET` and `CHAT_HISTORY_TOKEN_BUDGET` set small, for example 50 and 200. Alice has 20 long matching memories and a chat with 40 long turns.
- **Assertions:**
  - The token count of the memory block, including framing and separators and measured with the same counter, is ≤ its budget.
  - History is the most recent turns within its budget, always including the latest user message.
  - The total `text_input` is ≤ the sum of the budgets plus the fixed system line.
  - With `tiktoken` data unavailable, the fallback counter overestimates rather than underestimates.
- **Layer:** Unit and integration. **Dependencies:** T07, T08. **Status:** Not executed. N3 Hist-exec `context_budget_separators` failed.

### ACC-13 · Memory side-panel actions (frontend)
- **Assertions (Vitest + Testing Library, API mocked):**
  - "Edit Context" sends PATCH `content`.
  - "Exclude from Future" sends PATCH `is_excluded`.
  - "Delete Node" asks for confirmation, then sends DELETE.
  - Each invalidates the graph and node queries.
  - "Raw Text" shows `content`, not `name`.
- **Additional checks:** `npm run lint` and `npm run typecheck` pass. The component wraps itself in a `QueryClientProvider` in tests.
- **Layer:** Unit (component). It does not prove backend behavior; ACC-05 does. **Dependencies:** T11, plus Node.js (unavailable on the review machine). **Status:** Not executed.

### ACC-14 · Scale and latency (optional, measurement only)
- **Setup:** 1,000 synthetic memories for one user and 1,000 for another, in dev Postgres plus Chroma with the real default embedding function.
- **Measure:** p50 and p95 of retrieval and of the full `SendMessageView` with the adapter faked; precision of the top 5 on a labelled synthetic query set.
- **Report:** numbers only. The 500 ms target in N4 is **not approved**, so record pass or fail against it only if the operator confirms the target.
- **Layer:** E2E (dev). **Dependencies:** T08, B1, model download allowed. **Status:** Not executed.

## Traceability

| Finding | Tasks | Scenarios |
|---|---|---|
| FM-01 | T02 | ACC-04 rows 1–4, 11 |
| FM-02 | T03 | ACC-09 b |
| FM-03 | T10, T11, T12 | ACC-03 (log), ACC-05, ACC-06 |
| FM-04 | T06, T13 | ACC-08, ACC-10 d |
| FM-05 | T08 | ACC-01, ACC-11 |
| FM-06 | T09 | ACC-01 b, ACC-10 c |
| FM-07 | T03 | ACC-09 a, c |
| FM-08 | T05 | ACC-01, ACC-02 |
| FM-09 | T07 | ACC-02, ACC-08 row 2 |
| FM-10 | T03 | ACC-09 d |
| FM-11 | T10 | ACC-03 |
| FM-12 | T06 | ACC-10 a–b |
| FM-13 | T07, T08 | ACC-12 |
| FM-15 | T00, T01, T14 | T00/T01/T14 completion criteria |
| FM-17 | T11 | ACC-13 |
| FM-18 | T05 | ACC-02 (indirect) |
| FM-19 | T01 | T01 completion criteria, ACC-11 setup |
