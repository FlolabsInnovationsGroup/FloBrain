# Start FloBrain with Docker (see the websites)

This is the simple path: **build images → start containers → open your browser**.

## What you get

| Open in browser | What you see |
|-----------------|--------------|
| http://localhost:3000 | FloBrain **website** (Next.js UI) |
| http://localhost:8000/api/swagger/ | Django **API docs** |
| http://localhost:8001/docs | FastAPI **cloud** docs |
| http://localhost:8001/ | Cloud welcome JSON |

Docker builds **images** (blueprints) for website, backend, and cloud, then runs them as **containers** together with Postgres, MongoDB, and Redis.

## Windows (Docker Desktop)

1. Install and **start Docker Desktop** (wait until it says Engine is running).
2. Open PowerShell in the repo root.
3. Run:

```powershell
Copy-Item .env.example .env
.\scripts\start-flobrain-local.ps1
```

4. Wait until you see the URL banner (first build can take several minutes).
5. Open the links above in Chrome/Edge.

Stop later with:

```powershell
.\scripts\stop-flobrain-local.ps1
```

## Mental model (30 seconds)

```
docker compose up --build
        |
        |-- builds IMAGES from Dockerfiles
        |-- starts CONTAINERS from those images
        v
Your browser  -->  localhost:3000  (website container)
              -->  localhost:8000  (backend container)
              -->  localhost:8001  (cloud container)
```

You do **not** need to install Node/Python locally for this path. Docker runs the project files inside containers.

More detail + learning checklist: [DOCKER_LOCAL.md](./DOCKER_LOCAL.md)
