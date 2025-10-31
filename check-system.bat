@echo off
echo ====================================
echo ChifaaCare - System Check
echo ====================================
echo.

REM Check Node.js
echo [1/6] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js NOT installed
    echo    Install from: https://nodejs.org
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✓ Node.js %%i installed
)

echo.
REM Check npm
echo [2/6] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm NOT installed
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo ✓ npm %%i installed
)

echo.
REM Check frontend dependencies
echo [3/6] Checking frontend dependencies...
if exist "node_modules" (
    echo ✓ Frontend dependencies installed
) else (
    echo ❌ Frontend dependencies NOT installed
    echo    Run: npm install
)

echo.
REM Check backend dependencies
echo [4/6] Checking backend dependencies...
if exist "chifaacare-backend\node_modules" (
    echo ✓ Backend dependencies installed
) else (
    echo ❌ Backend dependencies NOT installed
    echo    Run: cd chifaacare-backend ^&^& npm install
)

echo.
REM Check .env file
echo [5/6] Checking environment configuration...
if exist "chifaacare-backend\.env" (
    echo ✓ .env file exists
    
    REM Check for DATABASE_URL
    findstr /C:"DATABASE_URL" "chifaacare-backend\.env" >nul 2>&1
    if errorlevel 1 (
        echo ❌ DATABASE_URL not found in .env
    ) else (
        echo ✓ DATABASE_URL configured
    )
    
    REM Check for JWT_SECRET
    findstr /C:"JWT_SECRET" "chifaacare-backend\.env" >nul 2>&1
    if errorlevel 1 (
        echo ❌ JWT_SECRET not found in .env
    ) else (
        echo ✓ JWT_SECRET configured
    )
) else (
    echo ❌ .env file NOT found
    echo    Copy .env.example to .env and configure it
)

echo.
REM Check Prisma Client
echo [6/6] Checking Prisma Client...
if exist "chifaacare-backend\node_modules\.prisma\client" (
    echo ✓ Prisma Client generated
) else (
    echo ❌ Prisma Client NOT generated
    echo    Run: cd chifaacare-backend ^&^& npm run prisma:generate
)

echo.
echo ====================================
echo System Check Complete
echo ====================================
echo.

REM Summary
set ALL_GOOD=1

if not exist "node_modules" set ALL_GOOD=0
if not exist "chifaacare-backend\node_modules" set ALL_GOOD=0
if not exist "chifaacare-backend\.env" set ALL_GOOD=0
if not exist "chifaacare-backend\node_modules\.prisma\client" set ALL_GOOD=0

if %ALL_GOOD%==1 (
    echo ✓✓✓ ALL CHECKS PASSED ✓✓✓
    echo.
    echo You are ready to start!
    echo Run: start-all.bat
) else (
    echo ❌ SOME CHECKS FAILED
    echo.
    echo Quick Fix:
    echo 1. Run: setup-database.bat
    echo 2. Then: start-all.bat
)

echo.
pause
