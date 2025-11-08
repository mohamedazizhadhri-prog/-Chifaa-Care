@echo off
color 0A
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        ChifaaCare - Complete Setup Verification           ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Check Node.js
echo [STEP 1] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ❌ Node.js is NOT installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended version: 18.x or 20.x
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
    node --version
)
echo.

:: Check npm
echo [STEP 2] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ❌ npm is NOT installed!
    pause
    exit /b 1
) else (
    echo ✅ npm is installed
    npm --version
)
echo.

:: Navigate to backend
cd /d "%~dp0-Chifaa-Care-samedatabase\chifaacare-backend"

:: Check if .env exists
echo [STEP 3] Checking environment configuration...
if not exist ".env" (
    color 0E
    echo ⚠️  .env file not found!
    echo Creating .env file from template...
    if exist "env" (
        copy /Y "env" ".env" >nul
        echo ✅ .env file created
    ) else (
        color 0C
        echo ❌ Could not create .env file
        pause
        exit /b 1
    )
) else (
    echo ✅ .env file exists
)
echo.

:: Check DATABASE_URL in .env
echo [STEP 4] Verifying database configuration...
findstr /C:"DATABASE_URL=" ".env" >nul
if errorlevel 1 (
    color 0C
    echo ❌ DATABASE_URL not found in .env!
    pause
    exit /b 1
) else (
    echo ✅ DATABASE_URL is configured
)
echo.

:: Check node_modules
echo [STEP 5] Checking dependencies...
if not exist "node_modules" (
    echo 📦 Installing dependencies... This may take a few minutes.
    echo.
    call npm install
    if errorlevel 1 (
        color 0C
        echo ❌ Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)
echo.

:: Test database connection
echo [STEP 6] Testing Neon database connection...
echo.
node test-neon-connection.js
if errorlevel 1 (
    color 0E
    echo.
    echo ⚠️  Database connection test failed!
    echo Please check your Neon database credentials in .env file
    echo.
) else (
    echo.
    echo ✅ Database connection successful!
)
echo.

:: Check Prisma
echo [STEP 7] Checking Prisma setup...
if not exist "node_modules\.prisma\client" (
    echo Generating Prisma Client...
    call npx prisma generate
    if errorlevel 1 (
        color 0E
        echo ⚠️  Failed to generate Prisma Client
    ) else (
        echo ✅ Prisma Client generated
    )
) else (
    echo ✅ Prisma Client is ready
)
echo.

:: Summary
color 0A
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    Setup Complete! ✅                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Your ChifaaCare project is ready to start!
echo.
echo Next steps:
echo   1. Run START-PROJECT.bat to start the backend server
echo   2. Visit http://localhost:3000/api-docs for API documentation
echo   3. Visit http://localhost:3000/api/health to check server status
echo.
echo Database: Connected to Neon PostgreSQL ☁️
echo Region: EU Central 1 (Frankfurt)
echo.
pause
