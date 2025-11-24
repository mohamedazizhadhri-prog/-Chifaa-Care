# Ramix - Discord Activity Controller

## Overview
A Windows Batch script application for managing Discord server activities using webhooks - no installation required!

## Features
- ✅ Send messages to Discord channels
- ✅ Send announcements with formatting
- ✅ Create event notifications
- ✅ Send embed messages with colors
- ✅ Activity status monitoring
- ✅ No coding knowledge required
- ✅ Works instantly on any Windows PC

## Quick Setup

### Step 1: Get Your Discord Webhook URL

1. Open Discord and go to your server
2. Right-click on the channel where you want the bot to post
3. Select **"Edit Channel"**
4. Go to **"Integrations"** → **"Webhooks"**
5. Click **"New Webhook"** (or use an existing one)
6. Click **"Copy Webhook URL"**

### Step 2: Configure Ramix

1. Right-click on `ramix.bat` and select **"Edit"**
2. Find this line near the top:
   ```batch
   set WEBHOOK_URL=YOUR_WEBHOOK_URL_HERE
   ```
3. Replace `YOUR_WEBHOOK_URL_HERE` with your webhook URL
4. Save and close the file

### Step 3: Run the Application

Double-click `ramix.bat` to start!

## Usage Guide

### Sending Messages
1. Choose option **1** from the menu
2. Type your message
3. Press Enter - message appears in Discord instantly!

### Sending Announcements
1. Choose option **2**
2. Type your announcement
3. It will be formatted with 📢 and bold text

### Creating Event Notifications
1. Choose option **3**
2. Enter event name, time, and description
3. A nicely formatted event notification is sent

### Sending Embed Messages
1. Choose option **4**
2. Enter title and description
3. Choose a color (decimal format):
   - Blue: 3447003
   - Red: 15158332
   - Green: 3066993
   - Yellow: 16776960
   - Purple: 10181046

## Advanced Usage

### Running Commands Automatically
Create a scheduled task to send messages at specific times:

```batch
ramix_auto.bat
```

### Integration Ideas
- **Event Reminders**: Schedule automatic event notifications
- **Status Updates**: Send server status updates
- **Announcements**: Automated community announcements
- **Activity Logs**: Log important activities to Discord

## Discord Activity Ideas

### Community Engagement
- Daily challenges or questions
- Event announcements
- Poll results
- Welcome messages for new members

### Server Management
- Maintenance notifications
- Rule updates
- Staff announcements
- Community milestones

### Gaming Activities
- Tournament announcements
- Match results
- Clan/Guild updates
- Game night notifications

## Customization

### Changing Colors
Edit the `color 0B` line in the batch file:
- `color 0A` - Green text
- `color 0B` - Cyan text
- `color 0E` - Yellow text
- `color 0C` - Red text

### Adding Custom Commands
Add new options to the menu by:
1. Adding a new menu item number
2. Creating a new section with `:YOUR_SECTION_NAME`
3. Adding the functionality you want

### Example: Add a Poll Feature
```batch
echo 8. Create Poll
...
if "%choice%"=="8" goto CREATE_POLL
...
:CREATE_POLL
set /p poll_question="Poll Question: "
set /p poll_option1="Option 1: "
set /p poll_option2="Option 2: "
curl -H "Content-Type: application/json" -d "{\"content\": \"📊 **POLL**\n\n%poll_question%\n\n1️⃣ %poll_option1%\n2️⃣ %poll_option2%\"}" %WEBHOOK_URL%
goto MENU
```

## Troubleshooting

### "curl is not recognized"
- Make sure you're on Windows 10 or later (curl is built-in)
- Or download curl from: https://curl.se/windows/

### Messages not appearing in Discord
- Check your webhook URL is correct
- Make sure the webhook hasn't been deleted
- Verify the channel still exists

### Special characters not working
- Avoid using quotes (") in messages
- Use simple text for best results

## Security Notes

⚠️ **Important:**
- Never share your webhook URL publicly
- Anyone with the webhook URL can post to your channel
- Consider creating separate webhooks for different purposes
- You can delete/regenerate webhooks anytime in Discord settings

## Future Enhancements

Want more features? You can:
- Add message scheduling
- Create custom embed templates
- Add reaction emoji support
- Build automated response systems

## Converting to EXE (Optional)

To create a standalone .exe file:
1. Download "Bat To Exe Converter"
2. Load `ramix.bat`
3. Compile to .exe
4. Now you have a portable Discord controller!

## Support

Need help? Check:
- Discord Webhook Documentation: https://discord.com/developers/docs/resources/webhook
- Batch Script Tutorials: https://www.tutorialspoint.com/batch_script/

---

**Pro Tip:** Create multiple copies of this script with different webhook URLs to manage multiple Discord channels or servers!
