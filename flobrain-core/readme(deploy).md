# FloBrain Core — backend deployment guide (GitHub Actions → S3 → SSM → EC2)

This document is a **complete, ordered checklist** for deploying the **FloBrain Django backend** in this monorepo (`flobrain-core/backend`). It follows the same **GitHub Actions → Amazon S3 → AWS Systems Manager (SSM) → EC2** pattern as the reference guide [`readme(deploy)2.md`](readme(deploy)2.md), adapted for **Python 3.11**, **Django**, and **PostgreSQL**.

---

## What you are building

|              Piece            |                                                        Purpose                                                          |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| **GitHub Actions**            | On push to the deploy branch, build a **deployment archive** (source tree + installable deps) and run AWS deploy steps. |
| **Amazon S3**                 | Holds the archive briefly; the server downloads it with a **presigned URL** (bucket can stay private).                  |
| **AWS Systems Manager (SSM)** | Runs a shell script **on the EC2 instance** from CI without storing SSH keys in GitHub.                                 |
| **EC2**                       | Runs **Gunicorn** (recommended) serving `flobrain.wsgi:application`, with configuration in `/home/ubuntu/app/flobrain-backend/.env`. |

**End-to-end flow:** push to branch → create tarball of `flobrain-core/backend` → upload to S3 → presigned URL → `ssm send-command` runs a script on the instance → script downloads the archive, extracts it, creates/updates a venv, `pip install`, writes `.env`, runs `migrate`, restarts Gunicorn, `curl` health check → workflow waits for SSM and fails if the remote script fails.

**Canonical workflow file (recommended location in this monorepo):**

`.github/workflows/deploy-flobrain-backend.yml`

*(Create this file at the **repository root** `Caipo-FloLabs/`, not inside `flobrain-core/` only, so GitHub Actions can see it.)*

---

## Repository facts (this project)
        
|        Item          |                                                    Value                                                     |
|----------------------|--------------------------------------------------------------------------------------------------------------|
| Backend root         | `flobrain-core/backend/` (contains `manage.py`, `requirements.txt`, `flobrain/`, apps `users`, `memory`, ...)|
| Python (Dockerfile)  | **3.11** (`python:3.11-slim`)                                                                                |             
| WSGI module          | `flobrain.wsgi:application`                                                                                  |
| Database             | **PostgreSQL** (`django.db.backends.postgresql`), configured via `DB_*` env vars                             |
| Dev server in Docker | `runserver 0.0.0.0:8000` — **not** for production; use **Gunicorn** on EC2                                   |
| Health check         | `GET /api/dashboard/health/` — implemented in `dashboard.views.DashboardHealthView` (checks DB connectivity) |

---

## Part A — One-time AWS setup

### A1. Choose region

Pick one region and use it consistently for EC2, S3, SSM, and IAM (e.g. **`us-east-1`**).

---

### A2. Create an S3 bucket for deploy artifacts

1. Create a bucket, e.g. `your-org-flobrain-deploy-<unique-suffix>`.
2. **Block public access** can remain enabled; the instance uses a **presigned URL**.
3. Note the **bucket name** and the **object key** you will use (e.g. `flobrain-backend-main.tar.gz` or a SHA-suffixed name per Part G3).

You will paste the bucket name into the workflow in both `aws s3 cp` and `aws s3 presign`.

---

### A3. Launch and prepare the EC2 instance

1. **AMI:** Ubuntu 22.04 LTS (or another Linux where Python 3.11 is available). The examples below assume user **`ubuntu`** and app path **`/home/ubuntu/app/flobrain-backend`**.
2. **Instance type:** Enough RAM/CPU for Django + Gunicorn workers (e.g. `t3.small` or larger, depending on load).
3. **Security group:** Allow **inbound TCP** on the port your API uses (e.g. **8000** if Gunicorn listens there directly, or **80/443** if you terminate TLS or reverse-proxy in front). Open **22** only if you use SSH; SSM does not require SSH.
4. **SSM connectivity:** Attach an **IAM instance profile** with **`AmazonSSMManagedInstanceCore`** (or equivalent). Ensure the instance can reach **SSM endpoints** (public subnet + public IP, or private subnet + VPC endpoints / NAT).
5. **One-time on the instance** (SSM Session Manager or SSH), install runtime dependencies:
   - **Python 3.11** and venv support, e.g. on Ubuntu:
     ```bash
     sudo apt-get update
     sudo apt-get install -y python3.11 python3.11-venv
     ```
   - Optional: build tools only if you switch from `psycopg2-binary` to a source build of `psycopg2`.
   - Create the app directory:
     ```bash
     sudo mkdir -p /home/ubuntu/app/flobrain-backend
     sudo chown -R ubuntu:ubuntu /home/ubuntu/app
     ```
6. **PostgreSQL:** Either:
   - run **Amazon RDS for PostgreSQL** (recommended for production), or
   - run Postgres on the same EC2 host or in Docker on that host.
   Point `DB_HOST` (and credentials) at that instance from `.env` (see Part B). The **default** in `flobrain/settings.py` for local dev is `localhost` with database `flobrain_db`, user `flo_user` — override all of these in production.
7. Note the EC2 **instance ID** (e.g. `i-0123456789abcdef0`) for `--instance-ids` in the workflow.

---

### A4. IAM identity for GitHub Actions (access keys or OIDC)

Create an IAM **user** (with access keys) or **OIDC role** trusted by GitHub. Minimum permissions for this deployment pattern:

**S3 (deploy bucket only)**

- `s3:PutObject`, `s3:GetObject` on `arn:aws:s3:::your-bucket-name/*`
- Optionally `s3:ListBucket` on `arn:aws:s3:::your-bucket-name` if your tooling needs it

**SSM**

- `ssm:SendCommand` scoped to your instance ARN(s) and document `AWS-RunShellScript`
- `ssm:GetCommandInvocation`
- `ssm:ListCommandInvocations` (as needed for your wait/poll logic)

Store access keys only in **GitHub Secrets** if you use them; never commit them.

---

## Part B — One-time GitHub repository setup

### B1. Add the workflow file

1. At repo root (`Caipo-FloLabs/`), create `.github/workflows/deploy-flobrain-backend.yml`.
2. Use **`defaults.run.working-directory`** or per-step `working-directory: flobrain-core/backend` so paths resolve correctly in this monorepo (see Part D).

---

### B2. Prerequisite: production WSGI server

The backend `Dockerfile` uses `runserver` for convenience. **On EC2, use Gunicorn** (or another production WSGI server).

1. Add to `flobrain-core/backend/requirements.txt` (or install only in CI/extra file — adding to `requirements.txt` is simplest):

   ```
   gunicorn
   ```

2. Commit that change before relying on the remote script below.

---

### B3. Configure GitHub Secrets

Add secrets under **Settings → Secrets and variables → Actions**.

**AWS (required for the S3 + SSM flow)**

| Secret name             |                     Used for                       |
|-------------------------|----------------------------------------------------|
| `AWS_ACCESS_KEY_ID`     | `configure-aws-credentials` and AWS CLI in the job |
| `AWS_SECRET_ACCESS_KEY` | Same                                               |

**Application / infrastructure (map to `/home/ubuntu/app/flobrain-backend/.env` on each deploy)**

These names match what `flobrain/settings.py` reads via `os.environ` today:

|          Secret name         | In workflow `.env` line (example)   |
|------------------------------|-------------------------------------|
| `DB_NAME`                    | `DB_NAME=flobrain_db`               |
| `DB_USER`                    | `DB_USER=...`                       |
| `DB_PASS`                    | `DB_PASS=...`                       |
| `DB_HOST`                    | `DB_HOST=your-rds-or-postgres-host` |
| `DB_PORT`                    | `DB_PORT=5432`                      |
| `SMTP_HOST`                  | `SMTP_HOST=...`                     |
| `SMTP_PORT`                  | `SMTP_PORT=465`                     |
| `SMTP_USER`                  | `SMTP_USER=...`                     |
| `SMTP_PASS`                  | `SMTP_PASS=...`                     |
| `SALES_EMAIL`                | `SALES_EMAIL=...`                   |

**Security note:** `settings.py` currently sets `SECRET_KEY` and `DEBUG` in code. For production you should **not** rely on the committed development `SECRET_KEY`. Options: (1) change `settings.py` to read `SECRET_KEY` from the environment and add a `SECRET_KEY` GitHub secret, or (2) deploy a private settings override — either way, rotate keys and set **`DEBUG=False`** and **`ALLOWED_HOSTS`** appropriately before going live. The workflow `.env` block should be extended to match whatever you implement.

Do **not** commit real `.env` files; keep `.env` in `.gitignore` (already expected for local Docker use).

---

### B4. Set the deploy branch

In the workflow `on.push.branches`, use your real default branch (e.g. **`main`**):

```yaml
on:
  push:
    branches:
      - main
```

Change to `master` or another branch if that is what you deploy from.

---

### B5. Recommended: concurrency

Avoid overlapping deploys:

```yaml
concurrency:
  group: deploy-flobrain-backend
  cancel-in-progress: true
```

---

## Part C — What each workflow step does (reference implementation)

When you push to the configured branch, the job should:

1. **Checkout** — `actions/checkout@v4` (full clone or shallow is fine).
2. **Set up Python 3.11** — `actions/setup-python@v5` with `python-version: '3.11'` and pip caching.
3. **Install dependencies** — from `flobrain-core/backend`:
   ```bash
   pip install -r requirements.txt
   ```
4. **Build archive** — from `flobrain-core/backend`, exclude noise and secrets, e.g.:
   ```bash
   tar czf /tmp/flobrain-backend.tar.gz \
     --exclude='venv' \
     --exclude='.venv' \
     --exclude='__pycache__' \
     --exclude='*.pyc' \
     --exclude='.env' \
     .
   ```
5. **Configure AWS credentials** — `aws-actions/configure-aws-credentials@v4` with your region.
6. **Upload to S3** — `aws s3 cp /tmp/flobrain-backend.tar.gz s3://<bucket>/<key>.tar.gz`
7. **Deploy via SSM** — inline script that:
   - Runs `aws s3 presign s3://<bucket>/<key>.tar.gz --expires-in 300`
   - Calls `aws ssm send-command` with `--document-name "AWS-RunShellScript"` and `--parameters commands=[...]` (JSON array of shell lines; each array element is one line of script).
   - Remote script (conceptual order):
     1. `curl -fL "<presigned-url>" -o /tmp/flobrain-backend.tar.gz`
     2. Extract under `/home/ubuntu/app/flobrain-backend` (remove old code or extract to a new folder, then swap — see Part G1 rollback).
     3. `cd /home/ubuntu/app/flobrain-backend`
     4. `python3.11 -m venv venv && . venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt`
     5. `sudo tee /home/ubuntu/app/flobrain-backend/.env` with the GitHub secret values (interpolated by Actions **at workflow render time** — they become literals in the command sent to SSM).
     6. `sudo chown ubuntu:ubuntu /home/ubuntu/app/flobrain-backend/.env`
     7. `sudo -u ubuntu bash -c 'cd /home/ubuntu/app/flobrain-backend && . venv/bin/activate && python manage.py migrate --noinput'`
     8. Stop old process: `sudo pkill -f 'gunicorn.*flobrain.wsgi' || true` (adjust pattern to match your start command).
     9. Start Gunicorn, e.g.:
        ```bash
        sudo -u ubuntu bash -c 'cd /home/ubuntu/app/flobrain-backend && . venv/bin/activate && nohup gunicorn --bind 0.0.0.0:8000 --workers 3 flobrain.wsgi:application >> gunicorn.log 2>&1 &'
        ```
     10. Wait briefly, then health check:
         `curl -f http://localhost:8000/api/dashboard/health/ || exit 1`
   - Workflow captures **CommandId**, waits for completion (`aws ssm wait command-executed` or polling), then `aws ssm get-command-invocation` for stdout/stderr.

If any step fails (including `curl` health check), the GitHub Action should fail.

**Note:** The exact `tee` block must list every variable you need, one `KEY=value` per line, with secrets referenced as `${{ secrets.DB_PASS }}` etc. in the workflow YAML.

---

## Part D — Checklist to adapt this guide

1. **Monorepo paths** — Set `working-directory: flobrain-core/backend` for install/tar steps, or `cd flobrain-core/backend` in a composite step.
2. **Archive name** — Keep `s3 cp`, `presign`, `curl` output path, and remote paths in sync.
3. **S3** — Replace bucket and key everywhere.
4. **EC2** — Replace `--instance-ids` in `send-command` / wait / `get-command-invocation`.
5. **Paths and user** — If not using `/home/ubuntu/app/flobrain-backend` or `ubuntu`, update `mkdir`, `chown`, `cd`, and `sudo -u`.
6. **`.env` block** — Match variables read in `flobrain/settings.py` (`DB_*`, `SMTP_*`, `SALES_EMAIL`) plus any future env-based `SECRET_KEY` / `DEBUG` / `ALLOWED_HOSTS`.
7. **Health check** — Use **`http://localhost:8000/api/dashboard/health/`** (or your reverse-proxy URL if Gunicorn is not on 8000 publicly).
8. **Database** — Ensure Postgres is reachable from the instance security groups and credentials match secrets.
9. **Static files / HTTPS** — For a pure JSON API you may only need Gunicorn on 8000 behind an ALB; add `collectstatic` and WhiteNoise or nginx if you serve admin static assets in production.

---

## Part E — Placeholder reference values (replace all in your workflow)

Use these **only as templates**; do not copy real IDs from other projects.

| Item                   | Example placeholder                                                       |
|------------------------|---------------------------------------------------------------------------|
| Archive file           | `flobrain-backend-main.tar.gz` or `flobrain-backend-${GITHUB_SHA}.tar.gz` |
| S3 bucket              | `your-org-flobrain-deploy-<suffix>`                                       |
| EC2 instance ID        | `i-0xxxxxxxxxxxxxxxxx`                                                    |
| AWS region             | `us-east-1`                                                               |
| App directory          | `/home/ubuntu/app/flobrain-backend`                                       |
| Bind address           | `0.0.0.0:8000`                                                            |
| Health URL             | `http://localhost:8000/api/dashboard/health/`                             |
| Gunicorn module        | `flobrain.wsgi:application`                                               |
| SSM document           | `AWS-RunShellScript`                                                      |
| Presign expiry         | `300` seconds                                                             |

---

## Part F — Verifying a deploy

1. Open **GitHub → Actions** and select the latest backend deploy run.
2. Confirm **Build archive** and **Upload to S3** succeeded.
3. Open the **Deploy via AWS SSM** log; note **Command ID** if printed.
4. In AWS **Systems Manager → Run Command**, inspect **Output** if the job failed.
5. On the instance (SSM Session Manager or SSH):
   - `tail -f /home/ubuntu/app/flobrain-backend/gunicorn.log`
   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/dashboard/health/` → expect **200**.

---

## Part G — Production-ready improvements

### G1. Rollback

Keep the previous tarball or extracted directory before replacing:

```bash
cp -a /home/ubuntu/app/flobrain-backend /home/ubuntu/app/flobrain-backend.prev || true
```

On failure, restore the previous tree and restart Gunicorn.

### G2. Process management

Prefer **systemd** over `nohup` for restart policies and logging:

```ini
[Unit]
Description=FloBrain Gunicorn
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/app/flobrain-backend
EnvironmentFile=/home/ubuntu/app/flobrain-backend/.env
ExecStart=/home/ubuntu/app/flobrain-backend/venv/bin/gunicorn --bind 0.0.0.0:8000 --workers 3 flobrain.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

Then: `sudo systemctl daemon-reload && sudo systemctl enable --now flobrain-gunicorn` (unit filename as you choose).

### G3. Artifact versioning

Avoid overwriting a single key blindly:

```text
s3://bucket/flobrain-backend-${GITHUB_SHA}.tar.gz
```

Point `presign` and `curl` at the same key the job just uploaded.

### G4. Health check retry

Replace a fixed `sleep` with a small retry loop:

```bash
for i in 1 2 3 4 5 6 7 8 9 10; do
  curl -fsS http://localhost:8000/api/dashboard/health/ && break
  sleep 5
done || exit 1
```

### G5. Secrets management

Long term, prefer **AWS Systems Manager Parameter Store** or **Secrets Manager** instead of embedding all values in the SSM command string from GitHub, especially for database and SMTP passwords.

### G6. Script safety

In remote scripts, use:

```bash
set -euo pipefail
```

where compatible with how SSM wraps the command.

### G7. Logs and cleanup

Rotate `gunicorn.log` or use `journalctl` with systemd; remove `/tmp/flobrain-backend.tar.gz` after successful deploy.

### G8. Environment separation

Use branch-based workflows (e.g. `staging` vs `main`) with different instance IDs, buckets, or prefixes so production and staging never cross wires.

---

## Quick local parity (optional)

To mirror production behavior locally after adding Gunicorn:

```bash
cd flobrain-core/backend
source .venv/bin/activate   # or create venv first
pip install -r requirements.txt
export $(grep -v '^#' .env | xargs)   # if using .env file; adjust for your shell
python manage.py migrate
gunicorn --bind 0.0.0.0:8000 --workers 3 flobrain.wsgi:application
```

Then visit `http://127.0.0.1:8000/api/dashboard/health/`.

---

*This guide is specific to **FloBrain Core** (`flobrain-core/backend`). For the generic Java/JAR pattern, see [`readme(deploy)2.md`](readme(deploy)2.md).*
