@echo off
echo.
echo ================================================
echo    Testing Booking and Payment Flow
echo ================================================
echo.
echo This script will help you test the fixed booking system.
echo.
echo STEP 1: Checking if backend is running...
echo.

curl -s http://localhost:3000/api/health > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend is NOT running!
    echo.
    echo Please start the backend first:
    echo    1. Open a terminal
    echo    2. Run: start-backend.bat
    echo    3. Wait for "Server started on port 3000"
    echo    4. Then run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Backend is running on port 3000
echo.

echo STEP 2: Checking frontend...
echo.
curl -s http://localhost:4200 > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend is NOT running!
    echo.
    echo Please start the frontend:
    echo    1. Open a terminal
    echo    2. Run: start-frontend.bat
    echo    3. Wait for "Compiled successfully"
    echo    4. Then run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Frontend is running on port 4200
echo.

echo STEP 3: Checking current appointments...
echo.
cd chifaacare-backend
node debug-appointments.js
cd ..

echo.
echo ================================================
echo    Ready to Test!
echo ================================================
echo.
echo 📋 Test Checklist:
echo.
echo 1. Open browser: http://localhost:4200
echo 2. Login as a PATIENT account
echo 3. Click "Book Consultation"
echo 4. Select any doctor
echo 5. Choose a future date and time
echo 6. Fill in the reason
echo 7. Click "Confirm Booking"
echo 8. You should see the PAYMENT modal! ✅
echo.
echo 💳 Payment Test Card (Stripe Test Mode):
echo    Card Number: 4242 4242 4242 4242
echo    Expiry: Any future date (e.g., 12/25)
echo    CVC: Any 3 digits (e.g., 123)
echo    ZIP: Any 5 digits (e.g., 12345)
echo.
echo 🔍 If it doesn't work:
echo    1. Check browser console (F12) for errors
echo    2. Check backend terminal for logs
echo    3. Run: debug-appointments.bat to see appointments
echo.
echo ⌨️  Press any key to open browser...
pause > nul

start http://localhost:4200

echo.
echo Browser opened! Follow the test checklist above.
echo.
echo Keep this window open to see your appointment status.
echo Press Ctrl+C to exit.
echo.
pause
