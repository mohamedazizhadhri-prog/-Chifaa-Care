@echo off
echo.
echo ============================================
echo   PHARMACY AD SYSTEM - QUICK TEST
echo ============================================
echo.
echo Starting Angular development server...
echo.
echo The pharmacy ad system includes:
echo  - Full-screen overlay ad with 3 slides
echo  - Smart triggers (on load, scroll, periodic)
echo  - Enhanced static side banners
echo.
echo After the server starts:
echo  1. Navigate to http://localhost:4200
echo  2. Wait 1 second - overlay should appear
echo  3. Close it and scroll down 50%%
echo  4. Overlay appears again!
echo  5. Check the side banners (left and right)
echo.
echo Press Ctrl+C to stop the server
echo.
pause
cd /d "%~dp0"
ng serve --open
