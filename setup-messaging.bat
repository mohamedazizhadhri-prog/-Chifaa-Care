@echo off
echo ========================================
echo    Messaging System Setup
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Installing Socket.IO Client...
call npm install socket.io-client

if %errorlevel% == 0 (
    echo [OK] Socket.IO Client installed successfully!
) else (
    echo [FAIL] Failed to install Socket.IO Client
    pause
    exit /b 1
)

echo.
echo [2/3] Checking environment configuration...

if exist "src\environments\environment.ts" (
    echo [OK] Environment file found
    echo [INFO] Please add this line to environment.ts:
    echo   socketUrl: 'http://localhost:3000'
) else (
    echo [WARN] Environment file not found at standard location
)

echo.
echo [3/3] Setup complete!
echo.
echo ========================================
echo    Next Steps:
echo ========================================
echo.
echo 1. Add socketUrl to environment.ts:
echo    socketUrl: 'http://localhost:3000'
echo.
echo 2. Set up backend Socket.IO server
echo    (See BACKEND-SOCKET-EXAMPLE.md)
echo.
echo 3. Run your app:
echo    ng serve
echo.
echo 4. Navigate to /doctor/messages
echo.
echo ========================================
echo.

pause
