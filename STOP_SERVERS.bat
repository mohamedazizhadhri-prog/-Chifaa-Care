@echo off
color 0C
title STOP ALL SERVERS

echo ================================================
echo    STOPPING ALL RUNNING SERVERS
echo ================================================
echo.

echo Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
if errorlevel 1 (
    echo No Node.js processes found.
) else (
    echo ✅ All Node.js processes stopped.
)

echo.
echo Killing all ts-node-dev processes...
taskkill /F /IM ts-node-dev.cmd 2>nul

echo.
echo ================================================
echo    ✅ ALL SERVERS STOPPED
echo ================================================
echo.
echo You can now start fresh with START.bat
echo.
pause
