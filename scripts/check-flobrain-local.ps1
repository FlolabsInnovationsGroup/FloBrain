# Quick health checks for the FloBrain local stack.

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Test-Http($Name, $Url) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 8
        Write-Host "[OK]  $Name -> $Url (HTTP $($response.StatusCode))" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "[FAIL] $Name -> $Url ($($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

Write-Host "=== FloBrain local checks ===" -ForegroundColor Cyan
Write-Host ""

$ok = $true
$ok = (Test-Http "backend" "http://127.0.0.1:8000/") -and $ok
$ok = (Test-Http "swagger" "http://127.0.0.1:8000/api/swagger/") -and $ok
$ok = (Test-Http "cloud"   "http://127.0.0.1:8001/") -and $ok
$ok = (Test-Http "cloud docs" "http://127.0.0.1:8001/docs") -and $ok
$ok = (Test-Http "website" "http://localhost:3000/") -and $ok

Write-Host ""
Write-Host "Docker containers:" -ForegroundColor Cyan
docker compose ps

if (-not $ok) {
    Write-Host ""
    Write-Host "Some checks failed. Is the stack up? Try: .\scripts\start-flobrain-local.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "All basic HTTP checks passed." -ForegroundColor Green
