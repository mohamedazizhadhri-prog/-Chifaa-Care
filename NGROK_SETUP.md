# ngrok Setup Instructions

## Quick Setup (2 minutes)

### Step 1: Sign up for ngrok (Free)
Go to: https://dashboard.ngrok.com/signup

### Step 2: Get your authtoken
After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken

Copy your authtoken (looks like: `2abc123def456ghi789jkl0`)

### Step 3: Configure ngrok
Run this command with YOUR authtoken:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

Example:
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl0
```

### Step 4: Start ngrok
```bash
.\start-ngrok-frontend.bat
```

---

## Alternative: Use Local Network (No ngrok needed)

**Easier option - works immediately:**

1. Your computer IP: `192.168.1.17`
2. On your phone (same WiFi):
   - Open browser
   - Go to: `http://192.168.1.17:4200`

✅ **This works right now without any setup!**

---

## Which method to use?

**Use Local Network if:**
- ✅ Just want to test the app quickly
- ✅ Phone and computer on same WiFi
- ✅ Don't need PWA installation yet

**Use ngrok if:**
- Need HTTPS for PWA features
- Need to test push notifications
- Want to share with others
