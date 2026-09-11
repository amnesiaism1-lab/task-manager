# ===================================================================
#               TASK MANAGER PRO - POWERSHELL LAUNCHER
# ===================================================================

$RootPath = $PSScriptRoot
Set-Location $RootPath

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "          🚀 TASK MANAGER PRO — WORKSPACE LAUNCHER                 " -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Docker
Write-Host "[1/4] Checking Infrastructure Services..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    $dockerCheck = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Write-Host "      Docker is running. Starting PostgreSQL & Redis containers..." -ForegroundColor Green
        docker compose up -d
    }
} catch {
    # Ignore
}

if (-not $dockerRunning) {
    Write-Host "      Docker is not currently active." -ForegroundColor DarkYellow
    Write-Host "      If you have local PostgreSQL & Redis installed, they will be used." -ForegroundColor DarkYellow
}

# 2. Build Shared Package
Write-Host ""
Write-Host "[2/4] Verifying and Building Shared Types..." -ForegroundColor Yellow
npm run build:shared
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build shared package." -ForegroundColor Red
    exit 1
}
Write-Host "      Shared package built successfully." -ForegroundColor Green

# 3. Launch Backend
Write-Host ""
Write-Host "[3/4] Launching NestJS Backend (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$RootPath\backend'; Write-Host '--- Task Manager Backend API ---' -ForegroundColor Cyan; npm run start:dev"

# 4. Launch Frontend
Write-Host ""
Write-Host "[4/4] Launching Vite Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$RootPath\frontend'; Write-Host '--- Task Manager Frontend ---' -ForegroundColor Cyan; npm run dev"

# 5. Summary & Browser Launch
Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host " [SUCCESS] System is booting up!" -ForegroundColor Green
Write-Host ""
Write-Host "  👉 Frontend Web UI:  http://localhost:5173/" -ForegroundColor Cyan
Write-Host "  👉 Backend API:      http://localhost:3001/api" -ForegroundColor White
Write-Host "  👉 Swagger Docs:     http://localhost:3001/api/docs" -ForegroundColor White
Write-Host "  👉 Seed Credentials: admin@taskmanager.dev / Admin@123456" -ForegroundColor Yellow
Write-Host "===================================================================" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173/"
