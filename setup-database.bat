@echo off
echo ====================================
echo ChifaaCare - Database Setup
echo ====================================
echo.

cd chifaacare-backend

echo [1/5] Checking environment configuration...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env file from .env.example
    pause
    exit /b 1
)
echo ✓ Environment file found

echo.
echo [2/5] Installing dependencies...
if not exist "node_modules" (
    call npm install
) else (
    echo ✓ Dependencies already installed
)

echo.
echo [3/5] Testing Neon database connection...
call npm run test:neon
if errorlevel 1 (
    echo.
    echo ERROR: Cannot connect to database!
    echo Please check your DATABASE_URL in .env file
    pause
    exit /b 1
)

echo.
echo [4/5] Generating Prisma Client...
call npm run prisma:generate

echo.
echo [5/5] Running database migrations...
call npm run migrate:deploy

echo.
echo ====================================
echo ✓ Database setup completed successfully!
echo ====================================
echo.
echo Optional: Run 'npm run seed:safe' to add test data
echo Optional: Run 'npm run prisma:studio' to open database GUI
echo.
pause
