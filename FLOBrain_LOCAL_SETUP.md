# FloBrain Local Setup

Use these commands from the repository root on **Windows PowerShell** with **Docker Desktop**.

For the full Docker guide and junior learning checklist, see [DOCKER_LOCAL.md](./DOCKER_LOCAL.md).

## Branch

Work on your feature branch (or the team backend branch you were assigned).  
Docker files live at the repo root so you can start the whole stack with one command.

## First Run

```powershell
Copy-Item .env.example .env
.\scripts\start-flobrain-local.ps1
```

What this does:

- Starts the **full DEV stack** with Docker Compose from the **repo root**:
  - `website` (Next.js) → http://localhost:3000
  - `backend` (Django) → http://127.0.0.1:8000
  - `cloud` (FastAPI) → http://127.0.0.1:8001
  - `db` (Postgres), `mongodb`, `redis`
- Uses FloBrain Docker names:
  - Project: `flobrain_local`
  - Containers: `flobrain_website`, `flobrain_backend_django`, `flobrain_cloud_api`, `flobrain_backend_db`, `flobrain_backend_mongodb`, `flobrain_backend_redis`
  - Volumes: `flobrain_backend_postgres_data`, `flobrain_mongo_data`
  - Network: `flobrain_local_network`
- Creates `.env` from `.env.example` if missing.
- Creates `flobrain-website/.env.local` if missing.
- Bind-mounts source code for hot reload (DEV mode).

Keep the terminal open to follow logs (or press Ctrl+C and containers keep running until you stop them).

## Daily Run (DEV — hot reload)

```powershell
.\scripts\start-flobrain-local.ps1
```

Open:

- Website: http://localhost:3000
- Backend: http://127.0.0.1:8000
- API docs: http://127.0.0.1:8000/api/swagger/
- Cloud: http://127.0.0.1:8001/docs

## Demo Run (built images, no hot reload)

```powershell
.\scripts\start-flobrain-demo.ps1
```

This uses the standalone `docker-compose.demo.yml` (separate project name / volumes from DEV).

## Stop

```powershell
.\scripts\stop-flobrain-local.ps1
```

## Check

```powershell
.\scripts\check-flobrain-local.ps1
```

This hits backend, swagger, cloud, and website over HTTP and shows `docker compose ps`.

## Backend-only (optional)

If you only need Django + databases:

```powershell
cd flobrain-core\backend
docker compose up --build
```

Prefer the **root** scripts for the full product stack.
