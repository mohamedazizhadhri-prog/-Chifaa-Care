@echo off
echo ============================================
echo   ChifaaCare - Starting Your Project
echo ============================================
echo.

REM Stop any existing Node processes first
echo [0/6] Cleaning up existing processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✓ Cleanup complete
echo.

cd /d "%~dp0-Chifaa-Care-samedatabase\chifaacare-backend"

echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed
echo.

echo [2/6] Checking backend dependencies...
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Backend dependencies are installed
)
echo.

echo [3/6] Testing Neon database connection...
node test-neon-connection.js
if errorlevel 1 (
    echo ❌ Database connection failed!
    echo Please check your .env file and Neon database credentials
    pause
    exit /b 1
)
echo.

echo [4/6] Fixing any migration issues...
node fix-migrations.js
if errorlevel 1 (
    echo ⚠️  Migration fix had issues but continuing...
)
echo.

echo [5/6] Setting up database schema...
echo Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)
echo.

echo [6/6] Starting backend server...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   🚀 Backend server starting...
echo   📍 URL: http://localhost:3000
echo   📚 API Docs: http://localhost:3000/api-docs
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
