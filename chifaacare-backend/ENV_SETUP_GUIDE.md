# Environment Variables Setup Guide

## Required Configuration

### 1. Stripe API Key (REQUIRED for payment features)

**To get your Stripe API key:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create an account or sign in
3. Navigate to **Developers** → **API Keys**
4. Copy your **Secret key** (starts with `sk_test_` for test mode)
5. Update your `.env` file:
   ```
   STRIPE_SECRET_KEY="sk_test_YOUR_ACTUAL_KEY_HERE"
   ```

**Note:** Use test keys for development. Never commit real keys to version control!

### 2. Cloudinary (OPTIONAL for image uploads)

**To get your Cloudinary URL:**

1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Sign up or sign in
3. From your dashboard, find your **API Environment variable**
4. It will look like: `cloudinary://123456789012345:AbCdEfGhIjKlMnOpQrStUvWx@your_cloud_name`
5. Update your `.env` file:
   ```
   CLOUDINARY_URL="cloudinary://YOUR_ACTUAL_URL_HERE"
   ```

## Current Status

After updating the configuration, your backend will:

- ✅ Start successfully even without Stripe/Cloudinary configured
- ⚠️ Show warnings for missing services
- ❌ Throw clear errors if you try to use unconfigured services

## Quick Start (Development)

If you just want to test without Stripe/Cloudinary:

1. The app will run with warnings
2. Payment features will be disabled
3. Image uploads may not work

## Security Reminders

- ⚠️ **Never commit `.env` file to git**
- ✅ `.env` is already in `.gitignore`
- 🔑 Use different keys for development and production
- 🔒 Keep your API keys secret

## Troubleshooting

**Error: "Neither apiKey nor config.authenticator provided"**
- Solution: Add valid `STRIPE_SECRET_KEY` to `.env`

**Warning: "Missing CLOUDINARY_URL"**
- Solution: Add valid `CLOUDINARY_URL` to `.env` (optional)

**Backend won't start:**
- Check all required variables are set
- Verify DATABASE_URL is correct
- Ensure no syntax errors in `.env` file
