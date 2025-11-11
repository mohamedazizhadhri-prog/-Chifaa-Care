@echo off
echo ============================================
echo   Stopping All Node Processes
echo ============================================
echo.

echo Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node processes stopped
) else (
    echo ℹ No Node processes were running
)

echo.
echo Killing all ts-node-dev processes...
taskkill /F /IM ts-node-dev.exe 2>nul

echo.
echo ============================================
echo   All processes stopped!
echo ============================================
echo.
echo You can now run START-PROJECT.bat
echo.
pause
