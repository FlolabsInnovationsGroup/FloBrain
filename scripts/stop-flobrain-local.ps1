# Stop FloBrain local containers (keeps volumes / database data).
# Stops both DEV (default compose) and DEMO stacks if present.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "Stopping FloBrain DEV stack..." -ForegroundColor Cyan
docker compose down 2>$null

Write-Host "Stopping FloBrain DEMO stack (if running)..." -ForegroundColor Cyan
docker compose -f docker-compose.demo.yml down 2>$null

Write-Host "Stopped. Data volumes were kept (Postgres/Mongo)."
Write-Host "To wipe DEV data:  docker compose down -v"
Write-Host "To wipe DEMO data: docker compose -f docker-compose.demo.yml down -v"
