@echo off
echo 🚀 ChifaaCare Neon Database Migration
echo =====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "chifaacare-backend" (
    echo ❌ Backend directory not found
    pause
    exit /b 1
)

echo 📝 Setting up Neon environment...
cd chifaacare-backend
call npm run setup:neon
if %errorlevel% neq 0 (
    echo ❌ Failed to setup environment
    pause
    exit /b 1
)

echo.
echo 🔄 Testing Neon database connection...
call npm run test:neon
if %errorlevel% neq 0 (
    echo ❌ Database connection test failed
    echo.
    echo 💡 Please check:
    echo    1. Your Neon database URL in .env file
    echo    2. Your Neon project is active
    echo    3. Network connectivity
    pause
    exit /b 1
)

echo.
echo 🗄️ Setting up database schema...
call npm run setup:db
if %errorlevel% neq 0 (
    echo ❌ Database setup failed
    pause
    exit /b 1
)

echo.
echo 📦 Deploying database migrations...
call npm run migrate:deploy
if %errorlevel% neq 0 (
    echo ❌ Migration deployment failed
    pause
    exit /b 1
)

echo.
echo 🔧 Generating Prisma client...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo ❌ Prisma client generation failed
    pause
    exit /b 1
)

cd ..

echo.
echo 🎉 Neon database migration completed successfully!
echo.
echo 📝 Next steps:
echo    1. Start the backend server: cd chifaacare-backend ^&^& npm run dev
echo    2. Start the frontend: npm start
echo    3. Visit http://localhost:4200 for the frontend
echo    4. Visit http://localhost:3000/api-docs for API documentation
echo.
echo 🔗 Useful commands:
echo    - Test connection: cd chifaacare-backend ^&^& npm run test:neon
echo    - View database: cd chifaacare-backend ^&^& npm run prisma:studio
echo    - Seed database: cd chifaacare-backend ^&^& npm run seed:safe
echo.
pause
