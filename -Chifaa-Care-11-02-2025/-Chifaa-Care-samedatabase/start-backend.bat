@echo off
echo ====================================
echo ChifaaCare - Backend Server Startup
echo ====================================
echo.

cd chifaacare-backend

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js installed

echo.
echo [2/4] Checking dependencies...
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
) else (
    echo ✓ Dependencies already installed
)

echo.
echo [3/4] Generating Prisma Client...
call npm run prisma:generate

echo.
echo [4/4] Starting Backend Server...
echo.
echo ====================================
echo Backend will start on http://localhost:3000
echo API Docs available at http://localhost:3000/api-docs
echo Press Ctrl+C to stop the server
echo ====================================
echo.

call npm run dev
