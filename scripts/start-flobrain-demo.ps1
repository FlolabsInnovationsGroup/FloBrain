# Build Docker images and start DEMO containers (no hot-reload bind mounts).
# Best when you just want to open the websites and look at them.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FloBrain DEMO — images + containers" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

try {
    docker info | Out-Null
} catch {
    Write-Host "Docker Desktop is not running." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example" -ForegroundColor Yellow
    } else {
        Write-Host "Missing .env and .env.example." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Building DEMO images and starting containers..."
Write-Host ""
Write-Host "OPEN IN BROWSER after start:" -ForegroundColor Green
Write-Host "  http://localhost:3000"
Write-Host "  http://localhost:8000/api/swagger/"
Write-Host "  http://localhost:8001/docs"
Write-Host ""

docker compose -f docker-compose.demo.yml up --build -d
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "DEMO containers started." -ForegroundColor Green
Write-Host "  Website : http://localhost:3000"
Write-Host "  Backend : http://localhost:8000/api/swagger/"
Write-Host "  Cloud   : http://localhost:8001/docs"
Write-Host ""
Write-Host "Stop with: .\scripts\stop-flobrain-local.ps1"

try {
    Start-Process "http://localhost:3000"
} catch {}
