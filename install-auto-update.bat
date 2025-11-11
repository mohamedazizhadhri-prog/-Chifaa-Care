@echo off
echo ========================================
echo  AUTO-UPDATE MESSAGES - INSTALLATION
echo ========================================
echo.

cd /d "%~dp0"
cd -Chifaa-Care-samedatabase\src\app\portals\doctor\doctor-messages

echo Creating backups of original files...
if exist doctor-doctor-messages.component.ts (
    copy doctor-doctor-messages.component.ts doctor-doctor-messages.component.ts.backup
    echo ✓ Backed up .ts file
)

if exist doctor-doctor-messages.component.html (
    copy doctor-doctor-messages.component.html doctor-doctor-messages.component.html.backup
    echo ✓ Backed up .html file
)

if exist doctor-doctor-messages.component.scss (
    copy doctor-doctor-messages.component.scss doctor-doctor-messages.component.scss.backup
    echo ✓ Backed up .scss file
)

echo.
echo Installing improved files...

if exist doctor-doctor-messages.component.improved.ts (
    copy /Y doctor-doctor-messages.component.improved.ts doctor-doctor-messages.component.ts
    echo ✓ Installed improved TypeScript component
) else (
    echo ✗ Error: improved.ts file not found!
)

if exist doctor-doctor-messages.component.improved.html (
    copy /Y doctor-doctor-messages.component.improved.html doctor-doctor-messages.component.html
    echo ✓ Installed improved HTML template
) else (
    echo ✗ Error: improved.html file not found!
)

if exist doctor-doctor-messages.component.improved.scss (
    copy /Y doctor-doctor-messages.component.improved.scss doctor-doctor-messages.component.scss
    echo ✓ Installed improved SCSS styles
) else (
    echo ✗ Error: improved.scss file not found!
)

echo.
echo ========================================
echo  INSTALLATION COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your Angular development server
echo 2. Test the refresh functionality
echo 3. Check the AUTO-UPDATE-MESSAGES-GUIDE.md for details
echo.
echo To rollback:
echo   ren doctor-doctor-messages.component.ts doctor-doctor-messages.component.ts.new
echo   ren doctor-doctor-messages.component.ts.backup doctor-doctor-messages.component.ts
echo   (repeat for .html and .scss files)
echo.
pause
