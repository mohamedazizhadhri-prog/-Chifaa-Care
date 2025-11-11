@echo off
echo ============================================
echo   Database Connection Diagnostic
echo ============================================
echo.

cd /d "%~dp0-Chifaa-Care-samedatabase\chifaacare-backend"

node diagnose-db.js

echo.
pause
