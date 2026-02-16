#  Backend Structure
```
backend/
├── venv/                 <-- Your isolated Python environment
├── .gitignore            <-- VERY IMPORTANT (keeps venv out of Git)
├── requirements.txt      <-- Dependencies list
├── manage.py             <-- The command center
├── flobrain/             <-- The "Project Configuration" (Settings, URLs)
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── users/                <-- Your Django App (Business logic)
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── migrations/
    ├── models.py
    ├── tests.py
    └── views.py
```

# FloBrain Backend API

This is the Django + PostgreSQL backend for the FloBrain application. It is fully containerized using Docker to ensure a consistent development environment.

## Quick Start Guide (After clone github repo)

**Prerequisites:**
* Docker Desktop (installed and running)
* Git

### 1. Navigate to the Directory
Since this is part of the main monorepo, you must first move into the backend folder:
```bash
cd backend
```
### 2. First-Time Setup (Build & Run)
- To download the dependencies, build the containers, and start the app` for the first time`, run:
or 
- Rebuild (Maintenance): Run this only if you added a new library to requirements.txt or changed the Dockerfile

```bash
docker compose up --build 
```
What this does: Pulls the Postgres image, installs Python requirements, and starts the Django server.
Success: You will see `Watching for file changes with StatReloader in the terminal.`

#### Verify: Open http://localhost:8000 in your browser.

### 3. If you have already built the image once, you just need to start it:
Start the Server

```bash 
docker compose up
``` 

### 4. Running Django Commands
`⚠️ Important Rule: The containers must be running (docker compose up) for these commands to work. We use exec to send commands into the running Linux container.
`
```bash
docker compose exec web python manage.py "any command"
# examples 
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate
```

### 5. Database Access (PostgreSQL)
`⚠️ Important Rule:: The database container (db) must be running.`

Connect directly to the database inside the container:

Bash
```bash
docker compose exec db psql -U flo_user -d flobrain_db
```
- some commands 
   - List tables: \dt
   - any sql query(select * from users_table;)
   - Quit: \q

### 6. Troubleshooting & Reset
"I broke the database / I want a fresh start"
If you want to delete the database volume and start completely fresh (WARNING: This deletes all data):

```bash
docker compose down -v
docker compose up --build
``` 
"Port is already allocated"
If you see an error about port 5432 or 8000 being in use, make sure you don't have another Postgres instance or Django server running on your machine.