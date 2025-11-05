@echo off
echo ============================================
echo   ChifaaCare - Starting Your Project
echo ============================================
echo.

cd /d "%~dp0-Chifaa-Care-samedatabase\chifaacare-backend"

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed
echo.

echo [2/5] Checking backend dependencies...
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

echo [3/5] Testing Neon database connection...
node test-neon-connection.js
if errorlevel 1 (
    echo ❌ Database connection failed!
    echo Please check your .env file and Neon database credentials
    pause
    exit /b 1
)
echo.

echo [4/5] Setting up database schema...
echo Running Prisma migrations...
call npx prisma generate
call npx prisma migrate deploy
if errorlevel 1 (
    echo ⚠️  Migration warning - continuing anyway
)
echo.

echo [5/5] Starting backend server...
echo 🚀 Backend server will start on http://localhost:3000
echo 📚 API Documentation: http://localhost:3000/api-docs
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
