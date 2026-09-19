@echo off
title VARTA - Cyclone Intelligence Platform Launcher
color 0B
echo.
echo  ================================================================
echo   VARTA :: AI/ML Tropical Cyclone Diagnostic and Prediction System
echo   Smart India Hackathon 2026
echo  ================================================================
echo.

:: Check for Node.js
where /q node 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [SETUP] Node.js not found in PATH. Adding C:\Program Files\nodejs to PATH...
    set PATH=C:\Program Files\nodejs;%PATH%
)

:: Start Backend
echo [1/2] Starting VARTA Backend (FastAPI on port 8000)...
start "VARTA Backend - FastAPI" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python run.py"

:: Wait a moment for the backend to initialize
timeout /t 4 /nobreak > nul

:: Start Frontend
echo [2/2] Starting VARTA Frontend (Vite React on port 5173)...
start "VARTA Frontend - React+Vite" cmd /k "cd /d %~dp0frontend && set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"

echo.
echo  ================================================================
echo   Services Launched:
echo     Backend  : http://localhost:8000
echo     API Docs : http://localhost:8000/docs
echo     Frontend : http://localhost:5173
echo  ================================================================
echo.
echo  Press any key to exit this launcher window...
pause > nul
