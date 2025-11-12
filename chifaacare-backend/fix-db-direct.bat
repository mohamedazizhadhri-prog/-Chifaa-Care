@echo off
echo ====================================
echo ChifaaCare - Direct Database Fix
echo ====================================
echo.
echo This will directly add the missing columns to your database
echo.

cd /d "%~dp0"

echo [1/2] Running database fix...
node fix-db-direct.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo ✅ Database fixed successfully!
    echo ====================================
    echo.
    echo You can now restart your server.
    echo.
) else (
    echo.
    echo ====================================
    echo ❌ Fix failed! Please check the errors above.
    echo ====================================
    echo.
)

pause
