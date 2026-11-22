# FloBrain Backend Security & Robotics Assessment - Final Report

**Branch:** `feat/backend-security-robotics-assessment` (not committed, not
pushed - all changes below are working-tree edits, ready for PR).

This report consolidates all work completed across the Django backend
security/authorization task and the robotics repository assessment. It
reflects the final, team-confirmed configuration: CORS restricted to
`https://flobrain.ai`, and Model Registry writes restricted to the `admin`
role.

## 1. Security changes implemented

### SECRET_KEY (`flobrain-core/backend/flobrain/settings.py:28-44`)
- `DEBUG` is computed before `SECRET_KEY` because the fallback behavior
  depends on it.
- `DEBUG=True` and no `SECRET_KEY` set -> falls back to a fixed,
  clearly-named insecure dev string (`"django-insecure-local-development-only"`),
  zero friction for local work.
- `DEBUG=False` and no `SECRET_KEY` set -> raises `ImproperlyConfigured` and
  refuses to boot, rather than silently running with a guessable key.
- Verified live: booting with `DEBUG=False` and no `SECRET_KEY` fails fast
  with that exact message; booting with `DEBUG=True` and no `SECRET_KEY`
  succeeds.

### DEBUG
- Unchanged, safe default: `os.environ.get("DEBUG", "False") == "True"`.

### Cookies (`settings.py:240-241`)
- `SESSION_COOKIE_SECURE` and `CSRF_COOKIE_SECURE` now default to `not DEBUG`
  (previously unset/implicitly insecure), overridable via env var for any
  environment that genuinely needs otherwise. Safe to apply unconditionally
  because it only instructs the *browser* not to send the cookie over plain
  HTTP, and end users only ever reach FloBrain via the ALB's HTTPS listener.
  Verified via `check --deploy`: the corresponding warnings are gone.

### CSRF (`settings.py:50-52`)
- `CSRF_TRUSTED_ORIGINS` is unchanged - still purely env-driven, empty by
  default, never guessed. Treated as a setting separate from the CORS
  decision below, per instruction.

### ALLOWED_HOSTS (`settings.py:48`)
- Unchanged, already env-driven with safe local defaults
  (`0.0.0.0`/`127.0.0.1`/`localhost`). **Open item for DevOps:** confirm the
  `Host` header the ALB sends on target-group health checks is covered by the
  `ALLOWED_HOSTS` value configured in the real deployment, or `CommonMiddleware`
  will reject those probes with `DisallowedHost`. This cannot be verified from
  the repository alone.

### AWS ALB / HTTPS (`settings.py:194-232`)
Confirmed architecture: clients -> ALB (TLS terminated at the ALB's HTTPS
listener) -> Django over plain HTTP. Every related setting defaults to the
**safe/off** state and is gated behind its own environment variable:

| Setting | Default | Enable only after |
|---|---|---|
| `SECURE_PROXY_SSL_HEADER` | unset (`None`) unless `TRUST_ALB_FORWARDED_PROTO=True` | DevOps confirms the ALB (and nothing else reachable from outside it) sets `X-Forwarded-Proto` on every forwarded request, and that Django is unreachable except through the ALB. |
| `USE_X_FORWARDED_HOST` | `False` | DevOps confirms something in front of Django (ALB/CloudFront) legitimately rewrites `Host`. |
| `SECURE_SSL_REDIRECT` | `False` | `SECURE_PROXY_SSL_HEADER` trust is confirmed safe **and** the ALB health-check path is confirmed unaffected. Enabling this without proxy-header trust would redirect every request - including health-check probes that likely don't carry `X-Forwarded-Proto` - causing a redirect loop and failed health checks. |
| `SECURE_HSTS_SECONDS` / `..._INCLUDE_SUBDOMAINS` / `..._PRELOAD` | `0` / `False` / `False` | Only after `SECURE_SSL_REDIRECT` is safely on. HSTS preload is especially hard to reverse once browsers cache it - requires explicit DevOps sign-off. |

**No ALB/HTTPS-redirect/HSTS setting has been force-enabled.** This is
intentional per instruction: these remain safely configurable via env var,
not turned on without verified production confirmation.

### DevOps confirmation needed (deployment handoff - not code work)
1. Does the ALB set `X-Forwarded-Proto` on every request it forwards to this
   target group, with nothing else (e.g. CloudFront) in between that could
   strip or rewrite it?
2. Is the Django target group reachable **only** from the ALB (security group
   restricted to the ALB's security group, not `0.0.0.0/0`)?
3. What `Host` header value does the ALB send on target-group health-check
   requests, and is that value covered by the `ALLOWED_HOSTS` env var in the
   real deployment?
4. Has the actual production/staging database been confirmed as PostgreSQL
   with working connectivity from the deployed backend? **This has not been
   verified as part of this task** - all local/CI verification in this report
   used `DB_ENGINE=sqlite` for speed and isolation. The PostgreSQL branch of
   `settings.py:117-128` was reviewed by inspection only, not exercised
   against a live Postgres instance.
5. Once 1-2 are confirmed: is it acceptable to set
   `TRUST_ALB_FORWARDED_PROTO=True`, and separately, after confirming the
   health check isn't affected, `SECURE_SSL_REDIRECT=True`?

Until DevOps answers these, the code is ready (env-gated, all off) but
nothing has been turned on.

## 2. CORS configuration (`settings.py:166-191`)

Team-confirmed, implemented and verified:

- `CORS_ALLOW_ALL_ORIGINS = False`.
- `CORS_ALLOWED_ORIGINS` is built from the `CORS_ALLOWED_ORIGINS` environment
  variable (comma-separated).
- Production: only `https://flobrain.ai` is configured (`.env.example`
  documents this as the team-confirmed value). No `www`, staging, or other
  origin was added without confirmation.
- Development (`DEBUG=True` only): `http://localhost:3000` and
  `http://127.0.0.1:3000` are appended automatically. These never appear when
  `DEBUG=False`, so a misconfigured production env cannot accidentally
  inherit a dev-only origin.
- `CSRF_TRUSTED_ORIGINS` was **not** modified as part of this change - kept
  as a separate, independently-configured setting as instructed.

**Tests** (`flobrain-core/backend/flobrain/test_cors.py`, 12 tests): settings
computation for production-with-origin, production-without-origin,
production-never-includes-localhost, dev-adds-localhost,
dev-without-env-var, wildcard-disabled, and an explicit assertion that
`www.flobrain.ai`/`staging.flobrain.ai` are never invented; plus real
middleware behavior tests (GET and `OPTIONS` preflight) for both the approved
origin (`https://flobrain.ai`, headers present) and an unapproved origin
(`https://evil.example.com`, headers absent).

## 3. Model Registry authorization

Confirmed requirements, implemented and verified:

1. Only users with the `admin` role may `POST`/`PATCH`/`DELETE` AI model
   entries.
2. All authenticated users may `GET` the registry (`/api/model-registry/`),
   a single model (`/api/model-registry/{id}/`), and model names
   (`/api/model-registry/names/`) - no role check on reads.
3. Unauthenticated requests -> `401`.
4. Authenticated non-admin requests to write endpoints -> `403`.
5. No role-assignment API/UI exists; roles are assigned via Django Admin only.

**Implementation:**
- `users/permissions.py` (new) - `HasRole`/`IsAdmin`, a reusable DRF
  `BasePermission` that reuses the existing `get_user_from_request()` JWT
  helper (no Django built-in auth/permission system introduced) and checks
  role membership through the existing `UserRole` join table. Explicitly
  raises `NotAuthenticated`/`PermissionDenied` (rather than returning a bare
  boolean) so 401 vs. 403 is correct, since this app never populates
  `request.successful_authenticator`.
- `model_registry/views.py` - `AIModelListCreateView` and
  `AIModelDetailView` now override `get_permissions()` to apply `IsAdmin()`
  only to `POST` / `PATCH`+`DELETE` respectively; `GET` is unaffected.
  `AIModelNamesView` (`GET`-only) is untouched.
- `users/migrations/0003_create_admin_role.py` (new) - idempotent
  `RunPython` migration that `get_or_create`s the `admin` `Role` row with a
  description. Depends on `0002_initial_fix` (already on main) so the
  users app has a single migration leaf. Reverse operation removes that
  row (no-op if already absent).
- `users/admin.py` - `UserRole` registered in Django Admin (approved by
  Ofon). Finding: `User.roles` is a `ManyToManyField` with a custom
  `through=UserRole` model, so Django's default `User` admin form silently
  omits the `roles` field entirely - without registering `UserRole`
  separately, there was **no actual way** to assign a role to a user through
  Admin, despite that being the intended workflow. This fix uses only Django
  Admin's existing scaffolding; no new API or UI was built.

**Route note:** the confirmed requirement referenced `/api/model-names/`; the
existing, real route is `/api/model-registry/names/`
(`model_registry/urls.py`). The real route was used - no new endpoint was
invented.

**PUT note:** `AIModelDetailView` has never implemented `PUT`, only `PATCH`
(pre-existing, unrelated to this change). The admin-only gate covers `PATCH`
and `DELETE`; no `PUT` method was added.

**Tests** (`model_registry/tests.py::ModelRegistryPermissionsTestCase`, 18
tests): all 9 confirmed scenarios plus their unauthenticated counterparts and
a check that an unrelated (non-`admin`) role does not grant write access -
GET (no token/regular/admin) -> 401/200/200; POST/PATCH/DELETE (no
token/regular/admin) -> 401/403/success. The pre-existing
`ModelRegistryAPITestCase` (CRUD/validation behavior) now grants its shared
test user the `admin` role in `setUp()` so those tests continue to exercise
write behavior unchanged.

## 4. Test results (all actually executed)

| Command | Result |
|---|---|
| `manage.py check` | 0 issues |
| `manage.py check` (DEBUG=False, SECRET_KEY unset) | Fails fast with `ImproperlyConfigured`, as designed |
| `manage.py makemigrations --check --dry-run` | No changes detected |
| `manage.py test --noinput` (full suite) | **197/197 passed** |
| `manage.py check --deploy` (production-like env: `DEBUG=False`, real `SECRET_KEY`, `CORS_ALLOWED_ORIGINS=https://flobrain.ai`, `ALLOWED_HOSTS=flobrain.ai`) | **36 warnings** - `security.W004` (HSTS) and `security.W008` (SSL redirect) are the two intentionally-pending ALB items above; `security.W009` is an artifact of the throwaway key used for this local check, not a real finding; the remainder are pre-existing `drf_spectacular` schema-generation warnings (`W001`/`W002`), unrelated to security and unrelated to this task's changes. |

All verification was run against `DB_ENGINE=sqlite` locally/in CI, per
existing project convention for fast, isolated test runs. **PostgreSQL
connectivity in the real deployment was not verified as part of this task**
- see DevOps item 4 above.

## 5. Robotics assessment

Full assessment, hardware/BOM review, implementation-status table
(implemented/partial/planned with file-level evidence), integration
recommendation, gaps, and a 5-milestone roadmap now live in
[`docs/ROBOTICS_ASSESSMENT.md`](ROBOTICS_ASSESSMENT.md) (linked from
`flobrain-robotics/README.md`).

Summary: `flobrain-robotics/` remains an empty, honestly-labeled "Planned"
directory. No robotics functionality was built as part of this task, per
instruction - this was investigation and documentation only. The only
real hardware/firmware artifacts in the repository belong to an archived
wearable ("Caipo"), not a robot.

## 6. Remaining deployment handoff items

These are infrastructure/confirmation tasks for other teams, not unfinished
code:

| Item | Owner | Blocks |
|---|---|---|
| ALB `X-Forwarded-Proto` / security-group / health-check `Host` header confirmation | DevOps | `TRUST_ALB_FORWARDED_PROTO`, `SECURE_SSL_REDIRECT`, `ALLOWED_HOSTS` tuning |
| PostgreSQL connectivity verification against the real deployed database | DevOps | Confidence that `settings.py`'s Postgres branch works outside of this task's sqlite-based test runs |
| Robotics hardware ownership / chassis-motor-driver decision | Robotics/hardware team | Roadmap milestone 3 onward in `ROBOTICS_ASSESSMENT.md` |
| Decision on whether `flobrain-cloud` or `flobrain-core/backend` owns device/telemetry endpoints long-term | Engineering leadership | Roadmap milestone 1 onward |

Resolved in this phase (no longer open): CORS production origin
(`https://flobrain.ai`, confirmed) and Model Registry role model (`admin`
role via `UserRole`, confirmed by Ofon).

## 7. Files changed (this task, cumulative)

| File | Change |
|---|---|
| `flobrain-core/backend/flobrain/settings.py` | SECRET_KEY fail-safe, ALB/HTTPS block (all off by default), cookie security defaults, CORS restriction |
| `flobrain-core/backend/.env.example` | New - documents every env var with safe placeholders |
| `flobrain-core/backend/.gitignore` | `!.env.example` negation fix |
| `flobrain-core/backend/setup_venv.sh` | Preferred interpreter `python3.12` -> `python3.11`, matching CI |
| `.github/workflows/core-backend-ci.yml` | Full test discovery instead of an app allowlist |
| `flobrain-core/backend/users/test_auth_security.py` | New - 14 auth/token/ownership tests |
| `flobrain-core/backend/flobrain/test_cors.py` | New - 12 CORS settings/middleware tests |
| `flobrain-core/backend/users/permissions.py` | New - `HasRole`/`IsAdmin` DRF permission |
| `flobrain-core/backend/users/admin.py` | `UserRole` registered in Django Admin |
| `flobrain-core/backend/users/migrations/0003_create_admin_role.py` | New - seeds the `admin` `Role` (after `0002_initial_fix`) |
| `flobrain-core/backend/model_registry/views.py` | Admin-only `get_permissions()` on write methods |
| `flobrain-core/backend/model_registry/tests.py` | 18 new permission tests; existing test user granted `admin` |
| `docs/features/MODEL_REGISTRY.md` | Authorization section updated to reflect the admin-role gate |
| `docs/ROBOTICS_ASSESSMENT.md` | New - full robotics assessment and roadmap |
| `docs/BACKEND_SECURITY_REPORT.md` | New - this report |
| `flobrain-robotics/README.md` | Linked to the new assessment doc |

Nothing was committed or pushed. No secrets were printed, exposed, or added
to any tracked file.
