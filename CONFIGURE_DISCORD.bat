@echo off
color 0E
title Configure Discord Credentials

echo ================================================
echo    DISCORD CREDENTIALS SETUP
echo ================================================
echo.
echo You need to get credentials from Discord Developer Portal:
echo https://discord.com/developers/applications
echo.
echo ================================================
echo    INSTRUCTIONS:
echo ================================================
echo.
echo 1. Go to: https://discord.com/developers/applications
echo 2. Click "New Application"
echo 3. Name it: "Rami Card Game"
echo 4. Get these 3 values:
echo    - Application ID (General Information)
echo    - Public Key (General Information)  
echo    - Client Secret (OAuth2 ^> Reset Secret)
echo.
pause
echo.
echo Opening Discord Developer Portal...
start https://discord.com/developers/applications
echo.
echo ================================================
echo.

set /p client_id="Enter your APPLICATION ID: "
set /p public_key="Enter your PUBLIC KEY: "
set /p client_secret="Enter your CLIENT SECRET: "

echo.
echo ================================================
echo    Updating configuration files...
echo ================================================
echo.

REM Update server/.env
(
echo # Server Configuration
echo PORT=3000
echo NODE_ENV=development
echo.
echo # Discord Configuration
echo DISCORD_CLIENT_ID=%client_id%
echo DISCORD_CLIENT_SECRET=%client_secret%
echo DISCORD_PUBLIC_KEY=%public_key%
echo.
echo # Database Configuration ^(Optional^)
echo # DATABASE_URL=postgresql://postgres:password@localhost:5432/rami_db
echo.
echo # Redis Configuration ^(Optional^)
echo # REDIS_URL=redis://localhost:6379
echo.
echo # JWT Secret
echo JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
echo.
echo # CORS
echo ALLOWED_ORIGINS=http://localhost:5173,https://discord.com
) > server\.env

echo ✅ Updated server\.env

REM Update client/.env
(
echo VITE_SERVER_URL=http://localhost:3000
echo VITE_DISCORD_CLIENT_ID=%client_id%
) > client\.env

echo ✅ Updated client\.env

echo.
echo ================================================
echo    ✅ CONFIGURATION COMPLETE!
echo ================================================
echo.
echo Your credentials have been saved to:
echo   - server\.env
echo   - client\.env
echo.
echo Next steps:
echo   1. Start the servers: Double-click START.bat
echo   2. Test: Open test-client.html
echo.
pause
