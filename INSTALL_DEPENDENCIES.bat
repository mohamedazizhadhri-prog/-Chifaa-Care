@echo off
color 0A
title Installing Dependencies - Rami Discord Activity

echo ================================================
echo    INSTALLING ALL DEPENDENCIES
echo ================================================
echo.
echo This will install all required packages...
echo Please wait, this may take a few minutes.
echo.
pause

echo.
echo [1/4] Installing root dependencies...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo ❌ Root installation failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Installing server dependencies...
echo.
cd server
call npm install
if errorlevel 1 (
    echo.
    echo ❌ Server installation failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Installing client dependencies...
echo.
cd client
call npm install
if errorlevel 1 (
    echo.
    echo ❌ Client installation failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Installing shared dependencies...
echo.
cd shared
call npm install
if errorlevel 1 (
    echo.
    echo ❌ Shared installation failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ================================================
echo    ✅ ALL DEPENDENCIES INSTALLED!
echo ================================================
echo.
echo You can now start the servers:
echo   1. Double-click START.bat
echo   2. Or run: npm run dev
echo.
echo For Discord setup, edit these files:
echo   - server\.env
echo   - client\.env
echo.
pause
