@echo off
color 0B
title Rami Discord Activity - Quick Setup

echo ================================================
echo    RAMI DISCORD ACTIVITY - QUICK SETUP
echo ================================================
echo.

:MENU
echo.
echo What would you like to do?
echo.
echo 1. Install All Dependencies
echo 2. Setup Environment Files
echo 3. Start Development Servers
echo 4. Test Without Discord (Simple)
echo 5. Start Cloudflare Tunnel (For Discord Testing)
echo 6. Open Discord Developer Portal
echo 7. View Setup Guide
echo 8. Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto INSTALL
if "%choice%"=="2" goto SETUP_ENV
if "%choice%"=="3" goto START_DEV
if "%choice%"=="4" goto TEST_SIMPLE
if "%choice%"=="5" goto TUNNEL
if "%choice%"=="6" goto DISCORD_PORTAL
if "%choice%"=="7" goto GUIDE
if "%choice%"=="8" goto END
goto MENU

:INSTALL
echo.
echo ================================================
echo    Installing Dependencies...
echo ================================================
echo.
echo [1/4] Installing root dependencies...
call npm install
echo.
echo [2/4] Installing server dependencies...
cd server
call npm install
cd ..
echo.
echo [3/4] Installing client dependencies...
cd client
call npm install
cd ..
echo.
echo [4/4] Installing shared dependencies...
cd shared
call npm install
cd ..
echo.
echo ✅ All dependencies installed successfully!
echo.
pause
goto MENU

:SETUP_ENV
echo.
echo ================================================
echo    Environment File Setup
echo ================================================
echo.
echo Please follow these steps:
echo.
echo 1. Go to: https://discord.com/developers/applications
echo 2. Create a new application
echo 3. Get your Application ID, Client Secret, and Public Key
echo.
echo Current .env files location:
echo - Server: server\.env
echo - Client: client\.env
echo.
echo Open these files and replace:
echo   DISCORD_CLIENT_ID=your_client_id_here
echo   DISCORD_CLIENT_SECRET=your_client_secret_here
echo   DISCORD_PUBLIC_KEY=your_public_key_here
echo.
echo With your actual Discord credentials.
echo.
set /p open_server_env="Open server\.env now? (Y/N): "
if /i "%open_server_env%"=="Y" notepad server\.env
echo.
set /p open_client_env="Open client\.env now? (Y/N): "
if /i "%open_client_env%"=="Y" notepad client\.env
echo.
pause
goto MENU

:START_DEV
echo.
echo ================================================
echo    Starting Development Servers
echo ================================================
echo.
echo This will open 2 new windows:
echo   1. Server (Backend) - Port 3000
echo   2. Client (Frontend) - Port 5173
echo.
echo Press any key to start...
pause > nul
echo.
echo Starting Server...
start "Rami Server" cmd /k "cd server && npm run dev"
timeout /t 3 > nul
echo Starting Client...
start "Rami Client" cmd /k "cd client && npm run dev"
echo.
echo ✅ Development servers starting...
echo.
echo Server: http://localhost:3000
echo Client: http://localhost:5173
echo.
echo Both windows will stay open. Close them when done.
echo.
pause
goto MENU

:TEST_SIMPLE
echo.
echo ================================================
echo    Simple Test (No Discord Required)
echo ================================================
echo.
echo This will:
echo 1. Start the server
echo 2. Open the simple test client
echo.
echo Make sure server is running first!
echo.
set /p start_server="Start server now? (Y/N): "
if /i "%start_server%"=="Y" (
    start "Rami Server" cmd /k "cd server && npm run dev"
    echo Waiting for server to start...
    timeout /t 5 > nul
)
echo.
echo Opening test client...
start test-client.html
echo.
echo ✅ Test client opened!
echo.
echo Instructions:
echo 1. Open test-client.html in 2 browser windows
echo 2. Window 1: Connect → Create Game → Ready → Start
echo 3. Window 2: Connect → Join Game (paste ID) → Ready
echo.
pause
goto MENU

:TUNNEL
echo.
echo ================================================
echo    Cloudflare Tunnel Setup
echo ================================================
echo.
echo This creates a public URL for Discord testing.
echo.
echo Make sure your dev servers are running first!
echo.
set /p confirm="Start tunnel? (Y/N): "
if /i "%confirm%"=="Y" (
    echo.
    echo Starting Cloudflare Tunnel...
    echo.
    echo Copy the HTTPS URL that appears!
    echo You'll need it for Discord Developer Portal.
    echo.
    pause
    start "Cloudflare Tunnel" cmd /k "cloudflared.exe.exe tunnel --url http://localhost:5173"
    echo.
    echo Tunnel started!
    echo.
    echo Next steps:
    echo 1. Copy the cloudflare URL from the window
    echo 2. Go to Discord Developer Portal
    echo 3. Update your Activity URL mapping
    echo.
)
pause
goto MENU

:DISCORD_PORTAL
echo.
echo ================================================
echo    Opening Discord Developer Portal
echo ================================================
echo.
echo Opening browser...
start https://discord.com/developers/applications
echo.
echo In the portal:
echo 1. Select your application
echo 2. Go to "Activities"
echo 3. Add URL mapping:
echo    - Root: /.proxy
echo    - Target: (your cloudflare URL)
echo.
pause
goto MENU

:GUIDE
echo.
echo ================================================
echo    Opening Setup Guide
echo ================================================
echo.
start COMPLETE_SETUP_GUIDE.md
echo.
echo Setup guide opened!
echo.
pause
goto MENU

:END
echo.
echo Thanks for using Rami Discord Activity!
echo.
timeout /t 2 > nul
exit

:ERROR
echo.
echo ❌ Invalid choice. Please try again.
echo.
pause
goto MENU
