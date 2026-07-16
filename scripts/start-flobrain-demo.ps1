# Start FloBrain DEMO stack (built images, no hot-reload bind mounts).

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host ""
Write-Host "=== FloBrain local DEMO ===" -ForegroundColor Cyan
Write-Host "Repo: $Root"
Write-Host ""

try {
    docker info | Out-Null
} catch {
    Write-Host "Docker Desktop does not look like it is running." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example." -ForegroundColor Yellow
    } else {
        Write-Host "Missing .env and .env.example at repo root." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Building DEMO images (no source bind-mounts)..."
Write-Host "  website  -> http://localhost:3000"
Write-Host "  backend  -> http://localhost:8000"
Write-Host "  cloud    -> http://localhost:8001"
Write-Host ""

docker compose -f docker-compose.demo.yml up --build
