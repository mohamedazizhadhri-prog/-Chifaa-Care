@echo off
echo.
echo ================================================
echo     ChifaaCare - Appointment Debug Tool
echo ================================================
echo.
echo This tool helps you diagnose booking issues.
echo.
echo Choose an option:
echo.
echo 1. View all appointments (default)
echo 2. Clear PENDING appointments only
echo 3. Clear ALL appointments (use with caution!)
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

cd chifaacare-backend

if "%choice%"=="1" (
    echo.
    echo Fetching all appointments...
    echo.
    node debug-appointments.js
) else if "%choice%"=="2" (
    echo.
    set /p confirm="Are you sure you want to clear all PENDING appointments? (yes/no): "
    if /i "%confirm%"=="yes" (
        node debug-appointments.js clear-pending
    ) else (
        echo Operation cancelled.
    )
) else if "%choice%"=="3" (
    echo.
    set /p confirm="WARNING: This will delete ALL appointments! Are you absolutely sure? (yes/no): "
    if /i "%confirm%"=="yes" (
        node debug-appointments.js clear-all
    ) else (
        echo Operation cancelled.
    )
) else if "%choice%"=="4" (
    echo Exiting...
    exit /b 0
) else (
    echo.
    echo Fetching all appointments (default)...
    echo.
    node debug-appointments.js
)

cd ..

echo.
echo.
pause
