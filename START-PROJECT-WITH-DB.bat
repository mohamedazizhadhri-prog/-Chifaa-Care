@echo off
echo ========================================
echo  ChifaaCare - Starting with Neon DB
echo ========================================
echo.

cd /d "%~dp0-Chifaa-Care-samedatabase\chifaacare-backend"

echo [1/4] Checking Neon Database Connection...
echo.
node test-neon-connection.js
if errorlevel 1 (
    echo.
    echo ERROR: Could not connect to Neon database!
    echo Please check your connection string in .env file
    pause
    exit /b 1
)

echo.
echo [2/4] Generating Prisma Client...
echo.
call npm run prisma:generate
if errorlevel 1 (
    echo.
    echo ERROR: Failed to generate Prisma client!
    pause
    exit /b 1
)

echo.
echo [3/4] Running Database Migrations...
echo.
call npm run migrate:deploy
if errorlevel 1 (
    echo.
    echo WARNING: Migration may have failed. Check the output above.
    echo Continuing anyway...
)

echo.
echo [4/4] Starting the project...
echo.
cd ..
call start-all.bat

echo.
echo ========================================
echo  Project Started Successfully!
echo ========================================
echo  Backend: http://localhost:3000
echo  Frontend: http://localhost:4200
echo ========================================
