@echo off
color 0A
title Tunisian Rami Server

echo ================================================
echo    TUNISIAN RAMI - OFFICIAL RULES SERVER
echo ================================================
echo.
echo Starting Tunisian Rami server on port 3001...
echo.
echo Game Rules:
echo   - 2-4 players, 13 cards each
echo   - 2 decks + 2 Jokers = 106 cards
echo   - Turn phases: Draw → Meld → Discard
echo   - Winner gets -40 points
echo   - Others get penalty for remaining cards
echo.
echo ================================================

cd server
node test-server-rami.js

pause
