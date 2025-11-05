@echo off
echo ============================================
echo   Testing Neon Database Connection
echo ============================================
echo.

cd /d "%~dp0-Chifaa-Care-samedatabase\chifaacare-backend"

echo Testing connection to Neon database...
echo.

node test-neon-connection.js

echo.
echo ============================================
pause
