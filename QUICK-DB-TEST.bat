@echo off
echo ============================================
echo   Quick Database Connection Test
echo ============================================
echo.

cd /d "%~dp0-Chifaa-Care-samedatabase\chifaacare-backend"

echo Current directory:
cd
echo.

echo Checking if .env file exists...
if exist .env (
    echo ✓ .env file found
) else (
    echo ✗ .env file NOT found - creating it now...
    copy "%~dp0.env" .env
    echo ✓ .env file created
)
echo.

echo Testing database connection...
node test-neon-connection.js

echo.
echo ============================================
echo If connection failed, check:
echo 1. Your internet connection
echo 2. Neon database is active
echo 3. DATABASE_URL in .env is correct
echo ============================================
pause
