@echo off
echo ====================================
echo ChifaaCare - Complete Project Startup
echo ====================================
echo.
echo This will start BOTH frontend and backend servers
echo in separate windows.
echo.
pause

echo Starting Backend Server...
start "ChifaaCare Backend" cmd /k "cd /d %~dp0 && start-backend.bat"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
start "ChifaaCare Frontend" cmd /k "cd /d %~dp0 && start-frontend.bat"

echo.
echo ====================================
echo ✓ Both servers are starting!
echo ====================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:4200
echo.
echo Check the separate windows for server logs.
echo Close those windows to stop the servers.
echo.
pause
