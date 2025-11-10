@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  ChifaaCare Setup Verification
echo ========================================
echo.

:: Check Node.js
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js installed
node --version
echo.

:: Check npm
echo [2/5] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found!
    pause
    exit /b 1
)
echo ✅ npm installed
npm --version
echo.

:: Check if backend dependencies are installed
echo [3/5] Checking backend dependencies...
cd /d "%~dp0-Chifaa-Care-samedatabase\chifaacare-backend"
if not exist "node_modules\" (
    echo ⚠️  Backend dependencies not installed
    echo Installing now...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies!
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)
echo.

:: Check if frontend dependencies are installed
echo [4/5] Checking frontend dependencies...
cd ..
if not exist "node_modules\" (
    echo ⚠️  Frontend dependencies not installed
    echo Installing now...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies!
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)
echo.

:: Test Neon connection
echo [5/5] Testing Neon Database Connection...
cd chifaacare-backend
node test-neon-connection.js
if errorlevel 1 (
    echo.
    echo ⚠️  Could not connect to Neon database!
    echo Check your DATABASE_URL in chifaacare-backend\.env
    echo.
) else (
    echo.
    echo ✅ Neon database connection successful!
    echo.
)

echo ========================================
echo  Setup Verification Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run START-PROJECT-WITH-DB.bat to start your project
echo 2. Access frontend at http://localhost:4200
echo 3. Access backend at http://localhost:3000
echo.
pause
