@echo off
title Ramix - Discord Activity Controller
color 0B

REM ====================================================
REM Configuration - REPLACE WITH YOUR DISCORD WEBHOOK URL
REM ====================================================
set WEBHOOK_URL=https://discord.com/api/webhooks/1442523184288239729/fHsN4aK-ZyR7a7t6YbYERJ0MCCMeLpgz08_2njZAuP_5PptwdgKydAIX1hYprDOfWZAc

REM Check if webhook is configured
if "%WEBHOOK_URL%"=="https://discord.com/api/webhooks/1442523184288239729/fHsN4aK-ZyR7a7t6YbYERJ0MCCMeLpgz08_2njZAuP_5PptwdgKydAIX1hYprDOfWZAc" (
    echo.
    echo [ERROR] Please configure your Discord Webhook URL first!
    echo.
    echo Steps to get your webhook URL:
    echo 1. Go to your Discord server
    echo 2. Right-click on a channel and select "Edit Channel"
    echo 3. Go to "Integrations" then "Webhooks"
    echo 4. Click "New Webhook" or use an existing one
    echo 5. Copy the Webhook URL
    echo 6. Edit this file and replace YOUR_WEBHOOK_URL_HERE with your URL
    echo.
    pause
    exit
)

:MENU
cls
echo ====================================================
echo        Ramix - Discord Activity Controller
echo ====================================================
echo.
echo 1. Send Message to Discord
echo 2. Send Announcement
echo 3. Send Event Notification
echo 4. Send Embed Message
echo 5. Activity Status
echo 6. Configuration
echo 7. Exit
echo.
echo ====================================================
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto SEND_MESSAGE
if "%choice%"=="2" goto SEND_ANNOUNCEMENT
if "%choice%"=="3" goto SEND_EVENT
if "%choice%"=="4" goto SEND_EMBED
if "%choice%"=="5" goto ACTIVITY_STATUS
if "%choice%"=="6" goto CONFIG
if "%choice%"=="7" goto EXIT
echo Invalid choice! Please try again.
timeout /t 2 >nul
goto MENU

:SEND_MESSAGE
cls
echo ====================================================
echo              Send Message to Discord
echo ====================================================
echo.
set /p message="Enter your message: "
echo.
echo Sending message to Discord...
curl -H "Content-Type: application/json" -d "{\"content\": \"%message%\"}" %WEBHOOK_URL%
echo.
echo Message sent!
timeout /t 2 >nul
goto MENU

:SEND_ANNOUNCEMENT
cls
echo ====================================================
echo            Send Announcement
echo ====================================================
echo.
set /p announcement="Enter announcement: "
echo.
echo Sending announcement...
curl -H "Content-Type: application/json" -d "{\"content\": \"📢 **ANNOUNCEMENT**\n\n%announcement%\"}" %WEBHOOK_URL%
echo.
echo Announcement sent!
timeout /t 2 >nul
goto MENU

:SEND_EVENT
cls
echo ====================================================
echo          Send Event Notification
echo ====================================================
echo.
set /p event_name="Event Name: "
set /p event_time="Event Time: "
set /p event_desc="Event Description: "
echo.
echo Sending event notification...
curl -H "Content-Type: application/json" -d "{\"content\": \"🎉 **NEW EVENT**\n\n**%event_name%**\n⏰ Time: %event_time%\n📝 %event_desc%\"}" %WEBHOOK_URL%
echo.
echo Event notification sent!
timeout /t 2 >nul
goto MENU

:SEND_EMBED
cls
echo ====================================================
echo            Send Embed Message
echo ====================================================
echo.
set /p embed_title="Embed Title: "
set /p embed_desc="Embed Description: "
set /p embed_color="Color (in decimal, e.g., 3447003 for blue): "
echo.
echo Sending embed message...
curl -H "Content-Type: application/json" -d "{\"embeds\": [{\"title\": \"%embed_title%\", \"description\": \"%embed_desc%\", \"color\": %embed_color%}]}" %WEBHOOK_URL%
echo.
echo Embed message sent!
timeout /t 2 >nul
goto MENU

:ACTIVITY_STATUS
cls
echo ====================================================
echo              Activity Status
echo ====================================================
echo.
echo Current Activity Stats:
echo.
echo Status: Online
echo Webhook: Configured
echo Last Action: Ready
echo.
echo ====================================================
echo.
pause
goto MENU

:CONFIG
cls
echo ====================================================
echo              Configuration
echo ====================================================
echo.
echo Current Webhook URL: %WEBHOOK_URL%
echo.
echo To change configuration, edit ramix.bat in a text editor
echo and modify the WEBHOOK_URL variable at the top.
echo.
echo ====================================================
echo.
pause
goto MENU

:EXIT
cls
echo.
echo Thank you for using Ramix Discord Controller!
echo.
timeout /t 2 >nul
exit
