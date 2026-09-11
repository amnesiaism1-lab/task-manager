@echo off
title Task Manager Pro - Database Seeder
color 0E
cls

echo ===================================================================
echo             TASK MANAGER PRO - DATABASE SEEDER
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/2] Building shared types...
call npm run build:shared
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Shared build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo [2/2] Seeding database with demo data...
call npm --prefix backend run seed
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================================
    echo [SUCCESS] Database seeded successfully!
    echo Demo Accounts:
    echo   Admin:  admin@taskmanager.dev / Admin@123456
    echo   Dev:    developer@taskmanager.dev / Dev@123456
    echo ===================================================================
) else (
    echo.
    echo [ERROR] Seeding failed. Ensure PostgreSQL is running on port 5432.
)

echo.
pause
