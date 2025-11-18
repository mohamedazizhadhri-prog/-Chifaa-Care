# 🚀 QUICK START GUIDE

## ✅ The Fix is Complete!

Your backend is now configured to start successfully even without Stripe/Cloudinary API keys.

---

## 📋 Before You Start

### Run Configuration Check
```bash
npm run check-config
```

This will verify your `.env` file and show what's configured.

---

## 🏃‍♂️ Quick Start Options

### Option 1: Start Immediately (Testing Mode)
**No API keys needed** - Payment features disabled but server runs:

```bash
npm run dev
```

Expected warnings (safe to ignore):
```
[Stripe] Warning: STRIPE_SECRET_KEY not configured. Payment features will be disabled.
[Cloudinary] Missing CLOUDINARY_URL in .env. Uploads will fail until configured.
Server is running on port 3000 in development mode
```

✅ Server will work!
⚠️ Payment routes will return: "Stripe is not configured"

---

### Option 2: Enable Full Features

#### 🔑 Get Stripe API Key (5 minutes)
1. Go to: https://dashboard.stripe.com/register
2. Sign up (free for testing)
3. Navigate to: **Developers** → **API Keys**
4. Copy your **Test Secret Key** (starts with `sk_test_`)
5. Update your `.env` file:
   ```env
   STRIPE_SECRET_KEY="sk_test_YOUR_ACTUAL_KEY_HERE"
   ```
6. Restart: `npm run dev`

#### 📸 Get Cloudinary URL (5 minutes) - Optional
1. Go to: https://console.cloudinary.com/
2. Sign up (free tier available)
3. Copy **API Environment variable** from dashboard
4. Update your `.env` file:
   ```env
   CLOUDINARY_URL="cloudinary://YOUR_ACTUAL_URL_HERE"
   ```
5. Restart: `npm run dev`

---

## 📁 Important Files

### Modified Files (Already Done ✅)
- ✅ `.env` - Added placeholders for API keys
- ✅ `src/services/stripe.service.ts` - Safe initialization
- ✅ `src/services/stripeConnect.service.ts` - Safe initialization

### Documentation Files (New 📄)
- 📄 `STRIPE_FIX_SUMMARY.md` - Complete fix documentation
- 📄 `ENV_SETUP_GUIDE.md` - Detailed setup instructions
- 📄 `check-config.js` - Configuration checker script

---

## 🧪 Test Your Backend

### 1. Check Configuration
```bash
npm run check-config
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test Health Endpoint
Open browser or use curl:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T...",
  "environment": "development",
  "database": "Connected"
}
```

---

## 🎯 What Works Now

### ✅ Working Without Stripe
- Server starts successfully
- Authentication routes
- Doctor/Patient management
- Appointments (basic CRUD)
- Profile management
- Health checks
- API documentation

### ⚠️ Needs Stripe
- Payment processing
- Stripe webhooks
- Doctor payouts
- Refunds

### ⚠️ Needs Cloudinary
- Image uploads
- Profile pictures
- Document uploads

---

## 🔧 Troubleshooting

### Backend won't start?
```bash
# 1. Check configuration
npm run check-config

# 2. Verify .env file exists
ls -la .env  # Linux/Mac
dir .env     # Windows

# 3. Check for syntax errors in .env
# Make sure no quotes are broken, no extra spaces
```

### Still getting Stripe errors?
1. Make sure you saved `.env` file
2. Restart your terminal
3. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

### Can't connect to database?
- Check `DATABASE_URL` in `.env`
- Make sure your Neon database is active
- Test with: `npm run test:neon`

---

## 📚 Next Steps

1. ✅ **Now:** Start your backend - `npm run dev`
2. 📝 **Soon:** Get Stripe test key for payment features
3. 🎨 **Later:** Get Cloudinary for image uploads
4. 🚀 **Production:** Get production API keys when deploying

---

## 🆘 Need Help?

- Configuration issues? → See `ENV_SETUP_GUIDE.md`
- Fix details? → See `STRIPE_FIX_SUMMARY.md`
- Check config: → Run `npm run check-config`

---

**Status:** ✅ READY TO START
**Command:** `npm run dev`
**Expected:** Server starts with optional warnings (safe to ignore)
