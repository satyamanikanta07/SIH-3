@echo off
title Stop NER Logistics Services
color 0C

echo =====================================================================
echo    Stopping NER Logistics Services (Ports 8000, 5000, 5173)
echo =====================================================================
echo.

:: 1. Terminate Python ML Service on Port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Terminating ML Service (PID %%a) on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

:: 2. Terminate Node.js Backend API on Port 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo Terminating Backend API (PID %%a) on port 5000...
    taskkill /F /PID %%a >nul 2>&1
)

:: 3. Terminate Frontend Dev Server on Port 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Terminating Frontend Dev Server (PID %%a) on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo =====================================================================
echo  All NER Logistics microservice ports (8000, 5000, 5173) cleared!
echo =====================================================================
echo.
pause
