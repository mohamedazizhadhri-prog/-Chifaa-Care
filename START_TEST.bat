@echo off
color 0B
title Rami Game Test Server

echo.
echo ========================================
echo    RAMI GAME - TEST MODE
echo    No Database/Redis Required
echo ========================================
echo.

cd server

echo [1/3] Copying test environment...
copy .env.test .env >nul 2>&1
echo ✓ Environment configured

echo.
echo [2/3] Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
) else (
    echo ✓ Dependencies already installed
)

echo.
echo [3/3] Starting server...
echo.
echo ========================================
echo  Server will start on http://localhost:3001
echo.
echo  To test:
echo  1. Open test-client.html in 2 browsers
echo  2. Player 1: Connect and Create Game
echo  3. Player 2: Connect and Join Game
echo  4. Both mark ready and start playing!
echo ========================================
echo.

call npm run dev
