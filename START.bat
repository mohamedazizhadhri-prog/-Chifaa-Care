@echo off
color 0B
title Rami Discord Activity - Quick Start

echo ================================================
echo    RAMI DISCORD ACTIVITY - QUICK START
echo ================================================
echo.
echo Starting development servers...
echo.

REM Start server in new window
echo [1/2] Starting server (Port 3000)...
start "Rami Server" cmd /k "cd server && npm run dev"

REM Wait a bit for server to start
timeout /t 3 /nobreak > nul

REM Start client in new window  
echo [2/2] Starting client (Port 5173)...
start "Rami Client" cmd /k "cd client && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo Server: http://localhost:3000
echo Client: http://localhost:5173
echo.
echo Two new windows will open with the servers.
echo Keep them running while you test.
echo.
echo ================================================
echo    QUICK TEST OPTIONS:
echo ================================================
echo.
echo Option 1: Simple Test (Recommended for first test)
echo   - Open test-client.html in 2 browser windows
echo   - No Discord required
echo.
echo Option 2: React Client Test
echo   - Open http://localhost:5173 in 2 browser windows
echo   - Full UI but no Discord features
echo.
echo Option 3: Discord Test
echo   - Run: cloudflared.exe.exe tunnel --url http://localhost:5173
echo   - Configure in Discord Developer Portal
echo   - Test in Discord voice channel
echo.
echo ================================================

pause
