@echo off
echo ========================================
echo    Ad Banner Image Setup Script
echo ========================================
echo.

cd /d "%~dp0"

echo Copying images from chifaacare-homepage to src/assets/ads...
echo.

REM Copy Libya Pharm
copy "chifaacare-homepage\src\assets\images\470203439_122183903306115260_8407236134122793375_n.jpg" "src\assets\ads\libya-pharm.png" >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] libya-pharm.png
) else (
    echo [FAIL] libya-pharm.png
)

REM Copy Alqalaa
copy "chifaacare-homepage\src\assets\images\491842433_1220689186734293_3249271571888617937_n.jpg" "src\assets\ads\alqalaa.png" >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] alqalaa.png
) else (
    echo [FAIL] alqalaa.png
)

REM Copy ALAFIA
copy "chifaacare-homepage\src\assets\images\Alafia-logo-2.png" "src\assets\ads\alafia.png" >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] alafia.png
) else (
    echo [FAIL] alafia.png
)

REM Copy PharmaLibya
copy "chifaacare-homepage\src\assets\images\Pharma-Libya-Full-01-2.png" "src\assets\ads\pharmalibya.png" >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] pharmalibya.png
) else (
    echo [FAIL] pharmalibya.png
)

REM Copy Libya Insurance
copy "chifaacare-homepage\src\assets\images\17047819323389.png" "src\assets\ads\insurance.png" >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] insurance.png
) else (
    echo [FAIL] insurance.png
)

echo.
echo ========================================
echo Verifying copied files...
echo ========================================
echo.

if exist "src\assets\ads\libya-pharm.png" (
    echo [EXISTS] libya-pharm.png
) else (
    echo [MISSING] libya-pharm.png
)

if exist "src\assets\ads\alqalaa.png" (
    echo [EXISTS] alqalaa.png
) else (
    echo [MISSING] alqalaa.png
)

if exist "src\assets\ads\alafia.png" (
    echo [EXISTS] alafia.png
) else (
    echo [MISSING] alafia.png
)

if exist "src\assets\ads\pharmalibya.png" (
    echo [EXISTS] pharmalibya.png
) else (
    echo [MISSING] pharmalibya.png
)

if exist "src\assets\ads\insurance.png" (
    echo [EXISTS] insurance.png
) else (
    echo [MISSING] insurance.png
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next step: Run "ng serve" to start your app
echo.
pause
