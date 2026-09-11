@echo off
title Task Manager Pro - Launcher
color 0A
cls

echo ===================================================================
echo               TASK MANAGER PRO - STARTUP LAUNCHER
echo ===================================================================
echo.

cd /d "%~dp0"

:: 1. Check Docker & Start Containers
echo [1/4] Checking Docker infrastructure...
docker ps >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Starting PostgreSQL and Redis via Docker Compose...
    docker compose up -d
) else (
    echo [NOTE] Docker daemon is not active. Using existing local PostgreSQL/Redis services if available.
)
echo.

:: 2. Build Shared Types
echo [2/4] Building @task-manager/shared library...
call npm run build:shared
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build shared package.
    pause
    exit /b %ERRORLEVEL%
)
echo.

:: 3. Launch Backend in new window
echo [3/4] Launching NestJS Backend Server (port 3001)...
start "Task Manager - Backend (API :3001)" cmd /k "cd /d %~dp0backend && npm run start:dev"

:: 4. Launch Frontend in new window
echo [4/4] Launching Vite Frontend (port 5173)...
start "Task Manager - Frontend (Web :5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Open Browser after a brief delay
echo.
echo ===================================================================
echo [SUCCESS] Both Backend and Frontend have been launched!
echo.
echo  - Frontend Web UI:  http://localhost:5173/
echo  - Backend API:      http://localhost:3001/api
echo  - Swagger Docs:     http://localhost:3001/api/docs
echo  - Demo Account:     admin@taskmanager.dev / Admin@123456
echo ===================================================================
echo.
timeout /t 3 >nul
start http://localhost:5173/
exit
