@echo off
color 0A
title Tunisian Rami - One Click Start

echo ================================================
echo    TUNISIAN RAMI - ONE CLICK START
echo ================================================
echo.
echo [1/2] Starting Rami server on port 3001...
echo.

REM Start the server in a new window
start "Rami Server" cmd /k "cd server && node test-server-rami.js"

echo [2/2] Waiting 3 seconds for server to start...
timeout /t 3 /nobreak > nul

echo.
echo [✓] Opening test client in your browser...
echo.

REM Open the test client in default browser
start "" "test-rami-client.html"

echo.
echo ================================================
echo    SETUP COMPLETE!
echo ================================================
echo.
echo The Rami server is running in a separate window.
echo The test client should open in your browser.
echo.
echo To test multiplayer:
echo   - Open test-rami-client.html in multiple browser tabs
echo   - Use different Player IDs: player1, player2, etc.
echo.
echo Press any key to exit this window...
echo (The server will keep running in the other window)
echo ================================================
pause > nul
