@echo off
color 0A
title Rami Test Server (Simple)

echo ================================================
echo    RAMI GAME - SIMPLE TEST SERVER
echo ================================================
echo.
echo Starting simple test server on port 3001...
echo.
echo This server works WITHOUT Redis or PostgreSQL
echo Perfect for testing the game logic!
echo.
echo ================================================

cd server
node test-server-simple.js

pause
