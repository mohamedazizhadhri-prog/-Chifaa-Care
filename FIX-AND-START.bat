@echo off
echo ============================================
echo   Fix Database and Start Project
echo ============================================
echo.

echo [1/4] Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✓ Processes stopped
echo.

echo [2/4] Fixing migration issues...
cd /d "%~dp0-Chifaa-Care-samedatabase\chifaacare-backend"
node fix-migrations.js
if %errorlevel% neq 0 (
    echo ❌ Failed to fix migrations
    pause
    exit /b 1
)
echo.

echo [3/4] Generating Prisma Client...
call npx prisma generate
echo.

echo [4/4] Starting backend server...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Backend server starting on http://localhost:3000
echo   API Documentation: http://localhost:3000/api-docs
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
