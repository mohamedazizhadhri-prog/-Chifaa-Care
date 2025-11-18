@echo off
echo ============================================
echo Chifaa Care - Clear Cache and Restart
echo ============================================
echo.

echo [1/5] Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Clearing Angular cache...
if exist ".angular" (
    rd /s /q .angular
    echo - Angular cache cleared
) else (
    echo - No Angular cache found
)

echo [3/5] Clearing dist folder...
if exist "dist" (
    rd /s /q dist
    echo - Dist folder cleared
) else (
    echo - No dist folder found
)

echo [4/5] Checking database content...
cd chifaacare-backend
node check-database-data.js
cd ..

echo.
echo [5/5] Ready to start!
echo.
echo ============================================
echo NEXT STEPS:
echo ============================================
echo 1. Start Backend:  cd chifaacare-backend && npm run start:dev
echo 2. Start Frontend: npm start
echo 3. Open browser in INCOGNITO/PRIVATE mode
echo 4. Go to: http://localhost:4200
echo 5. Clear browser cache (Ctrl+Shift+Delete)
echo 6. Log in and check Messages
echo ============================================
echo.
echo IMPORTANT: Open browser in INCOGNITO mode to avoid cache!
echo.
pause
