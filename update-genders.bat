@echo off
echo ====================================
echo Gender Update Script for ChifaaCare
echo ====================================
echo.
echo This script will update gender information for users in the database.
echo.
echo Females: Nadia, Salma, Leila, uranya, rdwf
echo Males: Omar, Ahmed, Karim, mohamed
echo.
pause

cd chifaacare-backend

echo.
echo Running gender update script...
echo.

node scripts/update-user-genders.js

echo.
pause
