@echo off
echo ====================================
echo ChifaaCare - Database Schema Fix
echo ====================================
echo.

echo [1/3] Stopping server if running...
timeout /t 2 /nobreak >nul

echo [2/3] Applying database migration...
cd /d "%~dp0"
call npx prisma migrate deploy

echo.
echo [3/3] Regenerating Prisma Client...
call npx prisma generate

echo.
echo ====================================
echo Database fix complete!
echo You can now restart your server using start-server.bat
echo ====================================
pause
