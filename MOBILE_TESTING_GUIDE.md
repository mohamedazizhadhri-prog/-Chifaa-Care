# Mobile Testing Guide for ChifaaCare PWA

## 🎯 Quick Start - Test on Your Phone

### Method 1: Local Network Testing (Easiest)

#### Step 1: Get Your Computer's IP Address

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
# Look for inet address (e.g., 192.168.1.100)
```

#### Step 2: Update Angular Dev Server

Edit `angular.json` or run:
```bash
ng serve --host 0.0.0.0 --disable-host-check
```

Or add to `package.json`:
```json
{
  "scripts": {
    "start": "ng serve --host 0.0.0.0 --disable-host-check",
    "start:mobile": "ng serve --host 0.0.0.0 --port 4200 --disable-host-check"
  }
}
```

#### Step 3: Update Backend to Accept External Connections

In `chifaacare-backend/src/index.ts`, ensure:
```typescript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
```

#### Step 4: Update CORS Settings

In `chifaacare-backend/src/index.ts`:
```typescript
app.use(cors({
  origin: '*', // For testing only! Use specific origins in production
  credentials: true
}));
```

#### Step 5: Access from Mobile

1. **Ensure phone and computer are on same WiFi network**
2. **Open mobile browser** (Chrome, Safari, Firefox)
3. **Navigate to:** `http://YOUR_IP:4200`
   - Example: `http://192.168.1.100:4200`

---

### Method 2: ngrok (For HTTPS Testing)

PWA features and push notifications require HTTPS. Use ngrok for testing:

#### Install ngrok
```bash
# Download from https://ngrok.com/download
# Or install via npm
npm install -g ngrok
```

#### Start Your Servers
```bash
# Terminal 1 - Backend
cd chifaacare-backend
npm run dev

# Terminal 2 - Frontend
cd ..
npm start
```

#### Create Tunnels

**For Frontend:**
```bash
ngrok http 4200
```
You'll get a URL like: `https://abc123.ngrok.io`

**For Backend:**
```bash
ngrok http 3000
```
You'll get a URL like: `https://xyz789.ngrok.io`

#### Update Frontend Environment

Create `src/environments/environment.mobile.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://xyz789.ngrok.io/api/v1', // Your ngrok backend URL
  vapidPublicKey: 'your_vapid_public_key'
};
```

#### Access on Mobile
Open `https://abc123.ngrok.io` on your phone

---

### Method 3: Deploy to Test Server

#### Option A: Netlify (Frontend)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build production
npm run build

# Deploy
netlify deploy --prod --dir=dist/chifaacare-homepage
```

#### Option B: Heroku (Backend)

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create chifaacare-backend

# Deploy
git push heroku main
```

---

## 📱 Testing PWA Features

### 1. Install PWA on Mobile

**Android (Chrome):**
1. Open app in Chrome
2. Tap menu (⋮)
3. Tap "Add to Home screen"
4. Tap "Add"
5. App icon appears on home screen

**iOS (Safari):**
1. Open app in Safari
2. Tap Share button
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen

### 2. Test Offline Mode

1. Open app on mobile
2. Browse around (loads data into cache)
3. Enable Airplane Mode
4. Navigate app - should still work!
5. View cached appointments and schedules

### 3. Test Push Notifications

**Enable Notifications:**
1. Open app
2. Tap "Allow" when prompted for notifications
3. Check notification settings in phone settings

**Test Notification:**
```typescript
// In browser console or via backend
fetch('http://YOUR_IP:3000/api/v1/notifications/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user-id',
    notification: {
      title: 'Test Notification',
      body: 'Testing from mobile!'
    }
  })
});
```

---

## 🔧 Troubleshooting

### Can't Access from Mobile

**Check Firewall:**
```bash
# Windows - Allow port 4200
netsh advfirewall firewall add rule name="Angular Dev" dir=in action=allow protocol=TCP localport=4200

# Mac - Disable firewall temporarily
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

**Verify Same Network:**
- Phone and computer must be on same WiFi
- Check IP address is correct
- Try pinging computer from phone (use network tools app)

### PWA Not Installing

**Requirements:**
- ✅ HTTPS (or localhost)
- ✅ Valid manifest.webmanifest
- ✅ Service worker registered
- ✅ Icons present

**Check in DevTools:**
1. Open Chrome DevTools on desktop
2. Application tab → Manifest
3. Verify all fields are valid

### Notifications Not Working

**Check Permissions:**
- Settings → Apps → ChifaaCare → Notifications → Enabled

**Check HTTPS:**
- Notifications require HTTPS (except localhost)
- Use ngrok for testing

**Check VAPID Keys:**
- Frontend and backend must have same public key
- Private key only on backend

---

## 📊 Testing Checklist

### Basic Functionality
- [ ] App loads on mobile browser
- [ ] Login works
- [ ] Navigation works
- [ ] Responsive design looks good
- [ ] Touch interactions work

### PWA Features
- [ ] "Add to Home Screen" prompt appears
- [ ] App installs successfully
- [ ] App icon appears on home screen
- [ ] App opens in standalone mode
- [ ] Splash screen shows on launch

### Offline Mode
- [ ] App works offline after first visit
- [ ] Cached data displays correctly
- [ ] Service worker registered
- [ ] Cache updates when online

### Push Notifications
- [ ] Permission prompt appears
- [ ] Notifications can be enabled
- [ ] Test notification received
- [ ] Notification appears in notification tray
- [ ] Tapping notification opens app
- [ ] Notification actions work

### Performance
- [ ] App loads quickly
- [ ] Smooth scrolling
- [ ] No lag in interactions
- [ ] Images load properly
- [ ] Forms work correctly

---

## 🎨 Mobile-Specific Testing

### Screen Sizes
Test on different devices:
- Small phones (iPhone SE, 320px)
- Medium phones (iPhone 12, 390px)
- Large phones (iPhone 14 Pro Max, 430px)
- Tablets (iPad, 768px)

### Orientations
- Portrait mode
- Landscape mode
- Rotation transitions

### Touch Gestures
- Tap
- Long press
- Swipe
- Pinch to zoom (if applicable)
- Pull to refresh

---

## 🚀 Production Mobile Testing

### Before Production

1. **Build Production:**
```bash
npm run build --configuration production
```

2. **Test Production Build:**
```bash
# Serve production build locally
npx http-server dist/chifaacare-homepage -p 8080
```

3. **Test on Real Devices:**
- iPhone (iOS Safari)
- Android (Chrome)
- Different screen sizes
- Different OS versions

4. **Performance Testing:**
- Use Lighthouse in Chrome DevTools
- Aim for 90+ PWA score
- Check mobile performance score

5. **Network Testing:**
- Test on 3G/4G/5G
- Test on slow connections
- Test offline scenarios

---

## 📱 Recommended Testing Tools

### Browser DevTools
- Chrome DevTools → Device Mode
- Responsive design testing
- Network throttling
- Service worker debugging

### Online Tools
- **BrowserStack** - Test on real devices
- **LambdaTest** - Cross-browser testing
- **Sauce Labs** - Mobile testing

### Mobile Apps
- **Chrome Remote Debugging** (Android)
- **Safari Web Inspector** (iOS)

---

## 🔐 Security Notes

### For Testing Only
```typescript
// NEVER use in production!
--disable-host-check
origin: '*'
```

### Production Settings
```typescript
// Use specific origins
cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true
})
```

---

## 📞 Quick Reference

### Start Development Servers (Mobile Testing)

```bash
# Terminal 1 - Backend (accept external connections)
cd chifaacare-backend
npm run dev

# Terminal 2 - Frontend (accept external connections)
cd ..
npm run start:mobile
# or
ng serve --host 0.0.0.0 --disable-host-check

# Terminal 3 - ngrok (for HTTPS)
ngrok http 4200
```

### Access URLs

**Local Network:**
- Frontend: `http://YOUR_IP:4200`
- Backend: `http://YOUR_IP:3000`

**ngrok:**
- Frontend: `https://abc123.ngrok.io`
- Backend: `https://xyz789.ngrok.io`

---

## ✅ Success Criteria

Your PWA is ready when:
- ✅ Installs on mobile home screen
- ✅ Works offline
- ✅ Sends push notifications
- ✅ Responsive on all screen sizes
- ✅ Lighthouse PWA score > 90
- ✅ Fast loading on mobile networks
- ✅ Touch interactions smooth
- ✅ No console errors

---

**Happy Testing!** 🎉
