@echo off
echo ============================================
echo   Port 3000 Status Check
echo ============================================
echo.

echo Checking what's running on port 3000...
echo.

netstat -ano | findstr :3000

if %errorlevel% equ 0 (
    echo.
    echo ⚠️  Port 3000 is currently in use!
    echo.
    echo To stop it, run: STOP-ALL.bat
    echo Or manually kill the process using Task Manager
) else (
    echo.
    echo ✅ Port 3000 is available!
    echo.
    echo You can now run: START-PROJECT.bat
)

echo.
echo ============================================
pause
