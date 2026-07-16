# FloBrain Local Setup

Use these commands from the repository root on Windows PowerShell.

## Branch

Work on:

```powershell
git switch Manis-firs-FloBrain-backend-branch
```

The exact requested branch name with spaces and an apostrophe is not a valid Git branch ref, so this branch uses a Git-safe equivalent.

## First Run

```powershell
.\scripts\start-flobrain-local.ps1
```

What this does:

- Starts the backend with Docker Compose from `flobrain-core/backend`.
- Uses FloBrain-specific Docker names:
  - Project: `flobrain_backend_local`
  - Containers: `flobrain_backend_django`, `flobrain_backend_db`, `flobrain_backend_mongodb`, `flobrain_backend_redis`
  - Volume: `flobrain_backend_postgres_data`
  - Network: `flobrain_backend_local_network`
- Creates `flobrain-website/.env.local` if missing.
- Installs website dependencies if `node_modules` is missing.
- Starts the Next.js website at `http://localhost:3000`.

Keep the terminal open while using the website.

## Daily Run

```powershell
git switch Manis-firs-FloBrain-backend-branch
.\scripts\start-flobrain-local.ps1
```

Open:

- Backend: `http://127.0.0.1:8000`
- API docs: `http://127.0.0.1:8000/api/swagger/`
- Website: `http://localhost:3000`

## Stop

Press `Ctrl+C` in the website terminal, then run:

```powershell
.\scripts\stop-flobrain-local.ps1
```

## Check

```powershell
.\scripts\check-flobrain-local.ps1
```

This checks the backend endpoint, TypeScript, and ESLint.
