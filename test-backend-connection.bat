@echo off
echo.
echo ===============================================
echo   TESTING BACKEND CONNECTION AND DATABASE
echo ===============================================
echo.

cd /d "%~dp0chifaacare-backend"

echo [1/4] Checking if backend is running...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Backend is running on port 3000
) else (
    echo ✗ Backend is NOT running!
    echo.
    echo Please start the backend first:
    echo   cd chifaacare-backend
    echo   npm start
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] Testing database connection...
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.count().then(count => { console.log('✓ Database connected! Users:', count); process.exit(0); }).catch(err => { console.error('✗ Database connection failed:', err.message); process.exit(1); });"

if %errorlevel%==0 (
    echo Database connection successful!
) else (
    echo Database connection failed!
    echo Check your .env file and DATABASE_URL
    pause
    exit /b 1
)

echo.
echo [3/4] Testing signup endpoint...
curl -X POST http://localhost:3000/api/v1/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test_doctor_%RANDOM%@test.com\",\"password\":\"Test1234!\",\"firstName\":\"Test\",\"lastName\":\"Doctor\",\"phone\":\"1234567890\",\"role\":\"DOCTOR\",\"specialization\":\"Cardiology\"}"

echo.
echo.
echo [4/4] Testing login endpoint...
curl -X POST http://localhost:3000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"password\":\"Test1234!\"}"

echo.
echo.
echo ===============================================
echo   Test Complete!
echo ===============================================
echo.
pause
