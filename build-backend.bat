@echo off
echo ========================================
echo Building ChifaaCare Backend
echo ========================================
echo.

cd chifaacare-backend

echo Compiling TypeScript...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build completed successfully!
    echo ========================================
    echo.
    echo You can now start the backend with:
    echo   cd chifaacare-backend
    echo   npm run dev
    echo.
) else (
    echo.
    echo ========================================
    echo Build failed! Please check errors above.
    echo ========================================
    echo.
)

pause
