# Start FloBrain local DEV stack (hot reload) on Windows Docker Desktop.
# Run from anywhere; script switches to repo root.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host ""
Write-Host "=== FloBrain local DEV ===" -ForegroundColor Cyan
Write-Host "Repo: $Root"
Write-Host ""

# Ensure Docker is available
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker Desktop does not look like it is running." -ForegroundColor Red
    Write-Host "Start Docker Desktop, wait until it is healthy, then run this script again."
    exit 1
}

# Create root .env from example if missing
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example (safe local defaults)." -ForegroundColor Yellow
    } else {
        Write-Host "Missing .env and .env.example at repo root." -ForegroundColor Red
        exit 1
    }
}

# Website env for people who also run Next outside Docker
$WebsiteEnv = Join-Path $Root "flobrain-website\.env.local"
$WebsiteExample = Join-Path $Root "flobrain-website\.env.example"
if (-not (Test-Path $WebsiteEnv) -and (Test-Path $WebsiteExample)) {
    Copy-Item $WebsiteExample $WebsiteEnv
    Write-Host "Created flobrain-website\.env.local from .env.example." -ForegroundColor Yellow
}

if (-not (Test-Path "flobrain-website\src")) {
    Write-Host "WARNING: flobrain-website\src is missing. Website container may fail to start." -ForegroundColor Yellow
}

Write-Host "Building and starting containers (first run can take several minutes)..."
Write-Host "  website  -> http://localhost:3000"
Write-Host "  backend  -> http://localhost:8000  (Swagger: /api/swagger/)"
Write-Host "  cloud    -> http://localhost:8001  (docs: /docs)"
Write-Host ""
Write-Host "Press Ctrl+C to stop following logs (containers keep running)."
Write-Host "To stop everything: .\scripts\stop-flobrain-local.ps1"
Write-Host ""

docker compose up --build
