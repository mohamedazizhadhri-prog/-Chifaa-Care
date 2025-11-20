# 🚀 QUICK START - Google Calendar Integration

## 🎯 What You Have Now

✅ Google OAuth Credentials Configured
✅ Environment Variables Updated
✅ All Backend Code Ready
✅ Database Schema Ready
✅ Setup Scripts Created

## ⚡ Start in 3 Commands

```bash
# 1. Install dependencies
cd chifaacare-backend
node setup-google-calendar.js

# 2. Start server
npm run dev

# 3. Test setup
node test-google-calendar.js
```

## 🔑 Your Credentials

```
Client ID:     1031649639772-bi1938h0d6688jf0vat5r01qmt2n8dg3.apps.googleusercontent.com
Client Secret: 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
API Key:       AIzaSyDbV-x7V7hRzG822dV68HXUv3-s-vyiDwM
```

## 📍 Important URLs

**Google Console:**
https://console.cloud.google.com/apis/credentials

**Redirect URI (Must be in Google Console):**
http://localhost:3000/api/v1/calendar/oauth/callback

**Test OAuth Flow:**
http://localhost:3000/api/v1/calendar/auth

## 🧪 Quick Test Commands

```bash
# Check server health
curl http://localhost:3000/api/health

# Start OAuth flow (replace TOKEN)
curl -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
     http://localhost:3000/api/v1/calendar/auth

# Check calendar connection
curl -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
     http://localhost:3000/api/v1/calendar/status

# Get pending appointments
curl -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
     http://localhost:3000/api/v1/appointments/doctor/pending
```

## 📱 Workflow at a Glance

```
1. Patient Books → Status: PENDING
                    ↓
2. Patient Pays  → Status: STILL PENDING ⭐
                    ↓
3. Doctor Sees   → Pending List
                    ↓
4. Doctor Acts   → Accept OR Reject
                    ↓
   ├─ Accept    → CONFIRMED + Calendar Event 📅
   └─ Reject    → CANCELLED + Refund 💰
```

## 🎨 Frontend Components to Create

1. **Calendar Settings** (`/doctor/calendar-settings`)
   - Connect/Disconnect button
   - Show connection status

2. **Pending Appointments** (`/doctor/pending`)
   - List paid appointments
   - Accept/Reject buttons

3. **Dashboard Widget**
   - Show pending count
   - Quick link to pending page

## ⚠️ Critical: Google Console Setup

MUST DO THIS:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth client
3. Add to "Authorized redirect URIs":
   ```
   http://localhost:3000/api/v1/calendar/oauth/callback
   ```
4. Click SAVE

## 🐛 Common Issues

**Issue:** "Redirect URI mismatch"
**Fix:** Check Google Console has EXACT URI (no trailing slash)

**Issue:** "googleapis not found"
**Fix:** Run `npm install googleapis`

**Issue:** "Calendar not connecting"
**Fix:** Ensure test users added in OAuth consent screen

**Issue:** "Appointments auto-confirming"
**Fix:** Check stripe.service.ts line ~170, should NOT set status to CONFIRMED

## 📚 Documentation Files

- `APPOINTMENT_WORKFLOW_COMPLETE.md` - Full guide
- `WORKFLOW_VISUAL_GUIDE.md` - Visual diagrams
- `QUICK_SETUP_CHECKLIST.md` - Step-by-step checklist
- `setup-google-calendar.js` - Installation script
- `test-google-calendar.js` - Testing script

## 🎉 Success Indicators

✅ Server starts without errors
✅ `/api/health` returns 200
✅ Can access `/api/v1/calendar/auth`
✅ Google OAuth page loads
✅ After auth, redirects back
✅ Calendar status shows "connected: true"
✅ Appointments stay PENDING after payment
✅ Doctor can accept/reject
✅ Calendar events appear in Google Calendar

## 🚨 NEXT STEPS

1. Run setup script: `node setup-google-calendar.js`
2. Start backend: `npm run dev`
3. Test with: `node test-google-calendar.js`
4. Add frontend components (code in APPOINTMENT_WORKFLOW_COMPLETE.md)
5. Test complete workflow
6. Deploy! 🚀

---

**Created:** November 5, 2025
**Status:** ✅ Ready to Deploy
**Estimated Setup Time:** 10 minutes

Need help? Check the documentation files or run the test script.
