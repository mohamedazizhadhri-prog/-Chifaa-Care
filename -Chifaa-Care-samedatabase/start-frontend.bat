@echo off
echo ====================================
echo ChifaaCare - Frontend Server Startup
echo ====================================
echo.

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js installed

echo.
echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo ✓ Dependencies already installed
)

echo.
echo [3/3] Starting Frontend Server...
echo.
echo ====================================
echo Frontend will start on http://localhost:4200
echo Press Ctrl+C to stop the server
echo ====================================
echo.

call npm start
