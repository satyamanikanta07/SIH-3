@echo off
title NER Smart Logistics Intelligence Platform Launcher
color 0A

echo =====================================================================
echo    NER Smart Logistics and Accessibility Intelligence Platform
echo =====================================================================
echo.
echo Starting all 3 microservices...
echo.

:: 1. Launch Python ML Service (Port 8000)
echo [1/3] Launching Python Machine Learning Microservice (Port 8000)...
start "NER Logistics - Python ML Service (Port 8000)" cmd /k "cd /d %~dp0ml-service && python run.py"

:: 2. Launch Node.js Backend API (Port 5000)
echo [2/3] Launching Node.js Express Backend API (Port 5000)...
start "NER Logistics - Node.js Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm start"

:: 3. Launch React Frontend (Port 5173)
echo [3/3] Launching React.js Frontend (Port 5173)...
start "NER Logistics - React Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================================
echo  Services Active:
echo    - Python ML API : http://localhost:8000 (Swagger: /docs)
echo    - Node.js API   : http://localhost:5000
echo    - React Web App : http://localhost:5173
echo.
echo  Role-Based Credentials:
echo    - Admin         : admin@nerlogistics.gov.in / admin123
echo    - Govt Official : official@nerlogistics.gov.in / official123
echo    - Field Officer : field@nerlogistics.gov.in / field123
echo    - Driver        : driver@nerlogistics.gov.in / driver123
echo =====================================================================
echo.
echo Waiting for servers to initialize before launching browser...
timeout /t 4 /nobreak >nul

start http://localhost:5173
echo Browser launched at http://localhost:5173
echo.
echo Keep this window open or close it when done.
pause
