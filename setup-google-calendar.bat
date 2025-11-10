@echo off
echo ============================================
echo Google Calendar Integration Setup
echo ============================================
echo.

cd chifaacare-backend

echo [1/4] Installing Google Calendar dependencies...
call npm install googleapis@130 @google-cloud/local-auth
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)

echo.
echo [3/4] Running database migration...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo WARNING: Migration may have failed. Check if database is running.
)

echo.
echo [4/4] Building TypeScript files...
call npm run build
if %errorlevel% neq 0 (
    echo WARNING: Build may have failed. Check for TypeScript errors.
)

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo NEXT STEPS:
echo 1. Set up Google Cloud Console (see GOOGLE-CALENDAR-APPOINTMENT-SYSTEM.md)
echo 2. Add these to your .env file:
echo    GOOGLE_CLIENT_ID=your_client_id
echo    GOOGLE_CLIENT_SECRET=your_client_secret
echo    GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/calendar/oauth/callback
echo 3. Start the backend: npm run dev
echo.
pause
