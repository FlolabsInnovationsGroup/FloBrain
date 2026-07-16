# FloBrain Docker Local Guide

> New here? Read **[START_HERE.md](./START_HERE.md)** first — build images, start containers, open the websites.

Run the full local stack from the **repo root** with one command.

| Service | URL | Role |
|---------|-----|------|
| Website (Next.js) | http://localhost:3000 | UI |
| Backend (Django) | http://localhost:8000 | Main API + Swagger at `/api/swagger/` |
| Cloud (FastAPI) | http://localhost:8001 | AI prototype (`/docs`) |
| Postgres | `localhost:5432` | Django ORM |
| MongoDB | `localhost:27017` | Workflow / memory collections |
| Redis | `localhost:6379` | Cache / task support |

> **Why cloud is on 8001:** Django already uses **8000**. Two processes cannot share the same host port.

---

## Prerequisites (Windows)

1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
2. Start Docker Desktop and wait until it says **Engine running**.
3. Clone this repo and open PowerShell in the repo root.

---

## First-time setup

```powershell
Copy-Item .env.example .env
.\scripts\start-flobrain-local.ps1
```

What happens:

1. Creates `.env` if missing (from `.env.example`).
2. Builds images for backend, cloud, and website.
3. Starts Postgres, MongoDB, Redis, Django, FastAPI cloud, and Next.js.
4. Mounts your source code into containers so edits hot-reload (**DEV** mode).

Keep the terminal open to see logs. In another terminal you can run checks:

```powershell
.\scripts\check-flobrain-local.ps1
```

Stop:

```powershell
.\scripts\stop-flobrain-local.ps1
```

---

## Daily DEV run (hot reload)

```powershell
.\scripts\start-flobrain-local.ps1
```

Equivalent raw Docker command:

```powershell
docker compose up --build
```

Edit files under `flobrain-core/backend`, `flobrain-cloud`, or `flobrain-website` on your laptop — containers pick up changes.

---

## DEMO run (built images, no hot reload)

Use this when you want a more self-contained “just run it” experience:

```powershell
.\scripts\start-flobrain-demo.ps1
```

Equivalent:

```powershell
docker compose -f docker-compose.demo.yml up --build
```

Code changes need a rebuild in demo mode. (Demo uses a **standalone** compose file so it does not inherit DEV bind mounts.)

---

## Useful commands (learning these pays off)

```powershell
# See running containers
docker compose ps

# Follow logs for one service
docker compose logs -f backend

# Run a Django management command inside the backend container
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser

# Open a shell inside a container
docker compose exec backend sh
docker compose exec website sh

# Stop containers but keep DB data
docker compose down

# Stop AND delete DB volumes (fresh database)
docker compose down -v
```

---

## Env files

| File | Purpose |
|------|---------|
| `.env.example` | Safe template (committed) |
| `.env` | Your local values (gitignored) — used by Compose |
| `flobrain-website/.env.example` | Website template |
| `flobrain-cloud/.env.example` | Cloud API keys template |
| `flobrain-core/backend/.env.example` | If you run Django outside Docker |

Never commit real API keys. Put secrets only in `.env` / `.env.local`.

---

## File map (what we added)

```
docker-compose.yml              # DEV stack (default)
docker-compose.demo.yml         # DEMO overrides
.env.example                    # Root env template
DOCKER_LOCAL.md                 # This guide
scripts/start-flobrain-local.ps1
scripts/start-flobrain-demo.ps1
scripts/stop-flobrain-local.ps1
scripts/check-flobrain-local.ps1
flobrain-core/backend/Dockerfile
flobrain-cloud/Dockerfile
flobrain-website/Dockerfile
```

The older `flobrain-core/backend/docker-compose.yml` still works for **backend-only** work. Prefer the **root** compose for the full stack.

---

## Junior learning checklist: Docker concepts used here

Work through these after the stack is running. Each item maps to something in our files.

### 1. Image vs container
- **Image** = recipe / snapshot (built from a `Dockerfile`).
- **Container** = a running instance of an image.
- Try: `docker images` and `docker ps`.

### 2. Dockerfile layers
- Each `RUN` / `COPY` creates a layer. Put rarely-changing steps (install deps) before frequently-changing ones (copy code) for faster rebuilds.
- See: `flobrain-core/backend/Dockerfile`, `flobrain-cloud/Dockerfile`.

### 3. Multi-stage / build targets
- One Dockerfile can define `development` and `production` stages (`target:` in compose).
- See: `flobrain-website/Dockerfile`, `flobrain-cloud/Dockerfile`.

### 4. Compose services
- `docker-compose.yml` declares services, ports, networks, volumes, and dependencies.
- `depends_on` controls start order (not always “ready”, which is why we use healthchecks + `pg_isready`).

### 5. Ports: host vs container
- `"8000:8000"` means host port → container port.
- Cloud uses **8001** on the host so it does not clash with Django’s **8000**.

### 6. Networks
- Services talk to each other by **service name** (`DB_HOST=db`, `MONGO_HOST=mongodb`).
- Your browser on Windows uses `localhost` because ports are published to the host.

### 7. Volumes (two kinds)
- **Named volumes** (`flobrain_backend_postgres_data`) keep database data across restarts.
- **Bind mounts** (`./flobrain-core/backend:/app`) sync your laptop folder into the container for hot reload.

### 8. Env vars
- Compose substitutes `${VAR:-default}` from `.env`.
- Apps also read env inside the container (`DB_HOST`, `NEXT_PUBLIC_API_URL`, …).

### 9. DEV vs DEMO
- DEV: bind-mount source + reload flags (`--reload`, `next dev`, `WATCHPACK_POLLING` for Windows).
- DEMO: bake code into the image; rebuild to pick up changes.

### 10. Why Windows needs polling
- Docker Desktop file events from Windows folders are not always reliable.
- `WATCHPACK_POLLING=true` makes Next.js poll for file changes.

### Stretch goals (when you are ready)
- Add a Celery worker service that uses Redis.
- Make `SECRET_KEY` / `DEBUG` env-driven in Django settings.
- Add a healthcheck endpoint and wire Compose `healthcheck` for backend/website.
- Learn `docker compose watch` (newer sync/rebuild workflow).

---

## Troubleshooting

| Symptom | What to try |
|---------|-------------|
| Port already in use | Stop other apps using 3000/8000/8001/5432/27017, or change the left side of `ports:` |
| Website cannot reach API | Confirm `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env` (browser → host, not Docker service name) |
| Postgres wait loop forever | `docker compose logs db` — check credentials match |
| Mongo init scripts did nothing | Init runs only on **first** empty volume; `docker compose down -v` then up again |
| Next.js not hot-reloading on Windows | Confirm `WATCHPACK_POLLING=true` (already set in DEV compose) |
| Cloud AI calls fail | Set `OPENAI_API_KEY` / `ELEVENLABS_API_KEY` in `.env` (optional for website+Django) |
| `docker info` fails | Start Docker Desktop and wait for the engine |

---

## Mental model (one picture)

```
[ Your browser on Windows ]
        |  localhost:3000          localhost:8000         localhost:8001
        v                          v                      v
   website container          backend container      cloud container
                                   |
                    +--------------+--------------+
                    v              v              v
                 Postgres       MongoDB         Redis
                 (db)          (mongodb)       (redis)
```

Inside Docker’s network, backend reaches Postgres at hostname `db`, not `localhost`.
`localhost` inside a container means “this container itself.”
