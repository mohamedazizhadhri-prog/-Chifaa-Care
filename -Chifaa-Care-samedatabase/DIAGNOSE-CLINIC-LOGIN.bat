@echo off
echo ========================================
echo CLINIC LOGIN DIAGNOSTIC TOOL
echo ========================================
echo.

cd chifaacare-backend

echo Step 1: Checking for clinic users...
echo.
node check-clinic-user.js
echo.
echo ========================================
echo.

pause

echo Step 2: Would you like to fix clinic roles? (Y/N)
set /p fix="Enter Y to fix roles, N to skip: "
if /i "%fix%"=="Y" (
    echo.
    echo Fixing clinic roles...
    node fix-clinic-role.js
    echo.
) else (
    echo Skipping role fix...
    echo.
)

echo ========================================
echo.

echo Step 3: Would you like to create a new clinic user? (Y/N)
set /p create="Enter Y to create user, N to skip: "
if /i "%create%"=="Y" (
    echo.
    echo Creating clinic user...
    node create-clinic-user.js
    echo.
) else (
    echo Skipping user creation...
    echo.
)

echo ========================================
echo.

echo Step 4: Would you like to test clinic login? (Y/N)
set /p test="Enter Y to test login, N to skip: "
if /i "%test%"=="Y" (
    echo.
    echo Testing clinic login...
    node test-clinic-login.js
    echo.
) else (
    echo Skipping login test...
    echo.
)

echo ========================================
echo.
echo ✅ Diagnostic complete!
echo.
echo Next steps:
echo 1. Make sure backend is running: npm start
echo 2. Make sure frontend is running: ng serve
echo 3. Try logging in at: http://localhost:4200
echo 4. Use the credentials shown above
echo.
echo If still having issues, check CLINIC-LOGIN-FIX.md
echo ========================================
pause
