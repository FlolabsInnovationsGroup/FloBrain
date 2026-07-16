# Build Docker images and start ALL FloBrain containers (DEV / hot reload).
# Then open the websites in your browser.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FloBrain — Docker images + containers" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Repo: $Root"
Write-Host ""

try {
    docker info | Out-Null
} catch {
    Write-Host "Docker Desktop is not running." -ForegroundColor Red
    Write-Host "1) Start Docker Desktop"
    Write-Host "2) Wait until it says the engine is running"
    Write-Host "3) Run this script again"
    exit 1
}

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example" -ForegroundColor Yellow
    } else {
        Write-Host "Missing .env and .env.example at repo root." -ForegroundColor Red
        exit 1
    }
}

$WebsiteEnv = Join-Path $Root "flobrain-website\.env.local"
$WebsiteExample = Join-Path $Root "flobrain-website\.env.example"
if (-not (Test-Path $WebsiteEnv) -and (Test-Path $WebsiteExample)) {
    Copy-Item $WebsiteExample $WebsiteEnv
    Write-Host "Created flobrain-website\.env.local" -ForegroundColor Yellow
}

if (-not (Test-Path "flobrain-website\src")) {
    Write-Host "WARNING: flobrain-website\src is missing — website may fail." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Building images and starting containers..." -ForegroundColor Green
Write-Host "(First run downloads base images and can take several minutes.)"
Write-Host ""
Write-Host "When ready, OPEN THESE IN YOUR BROWSER:" -ForegroundColor Green
Write-Host "  Website UI :  http://localhost:3000"
Write-Host "  API Swagger:  http://localhost:8000/api/swagger/"
Write-Host "  Cloud docs :  http://localhost:8001/docs"
Write-Host ""
Write-Host "Press Ctrl+C to detach from logs (containers keep running)."
Write-Host "Stop everything later with: .\scripts\stop-flobrain-local.ps1"
Write-Host ""

# Build images, then start containers in the background so URLs are usable immediately
docker compose up --build -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "docker compose failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Waiting for website to respond..." -ForegroundColor Cyan
$ready = $false
for ($i = 1; $i -le 60; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 3
        if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) {
            $ready = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 3
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Containers are up. Open these URLs:" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Website : http://localhost:3000"
Write-Host "  Backend : http://localhost:8000/api/swagger/"
Write-Host "  Cloud   : http://localhost:8001/docs"
Write-Host ""
Write-Host "Status:     docker compose ps"
Write-Host "Logs:       docker compose logs -f"
Write-Host "Stop:       .\scripts\stop-flobrain-local.ps1"
Write-Host "Check:      .\scripts\check-flobrain-local.ps1"
Write-Host ""

if (-not $ready) {
    Write-Host "Website is still starting. Run check script in a minute:" -ForegroundColor Yellow
    Write-Host "  .\scripts\check-flobrain-local.ps1"
}

# Try to open the main website in the default browser (Windows)
try {
    Start-Process "http://localhost:3000"
} catch {
    # ignore if browser cannot be launched from this shell
}
