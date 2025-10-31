# 💳 Payment System - Installation & Setup Guide

## ✅ What We Just Created

**Backend Files (4 files):**
1. ✅ `src/services/stripe.service.ts` - Stripe integration service
2. ✅ `src/controllers/payment.controller.ts` - Payment API logic
3. ✅ `src/routes/payment.routes.ts` - API endpoints
4. ✅ `src/types/payment.types.ts` - TypeScript types

**Database:**
5. ✅ Updated `prisma/schema.prisma` - Added Payment model

---

## 🚀 Installation Steps

### Step 1: Install Stripe Package

```bash
cd chifaacare-backend
npm install stripe
```

### Step 2: Update Environment Variables

Add these to `chifaacare-backend/.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**How to get these keys:**
1. Go to https://stripe.com
2. Sign up or login
3. Go to Dashboard → Developers → API keys
4. Copy "Publishable key" and "Secret key"
5. For webhook secret, we'll create it later

### Step 3: Run Database Migration

```bash
cd chifaacare-backend

# Generate Prisma Client
npm run prisma:generate

# Create and run migration
npx prisma migrate dev --name add_payment_model

# Verify migration
npx prisma migrate status
```

Expected output:
```
✓ Generated Prisma Client
✓ Migration applied successfully
Database schema is up to date
```

### Step 4: Update Main Server File

You need to register the payment routes in your main `index.ts` file.

Find your `chifaacare-backend/src/index.ts` and add:

```typescript
import paymentRoutes from './routes/payment.routes';

// ... other imports ...

// Register routes
app.use('/api/v1/payment', paymentRoutes);
```

**IMPORTANT for Webhook:** The webhook route needs raw body, so add this BEFORE your JSON middleware:

```typescript
// In index.ts, BEFORE app.use(express.json())
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));

// Then your normal JSON middleware
app.use(express.json());
```

---

## 🧪 Testing the Payment System

### Test 1: Get Stripe Config

```bash
curl http://localhost:3000/api/v1/payment/config
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "publishableKey": "pk_test_..."
  }
}
```

### Test 2: Create Payment Intent (requires auth token)

```bash
curl -X POST http://localhost:3000/api/v1/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "appointmentId": "appointment_id_here",
    "amount": 50.00,
    "currency": "usd"
  }'
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentId": "payment_id",
    "amount": 50,
    "currency": "USD"
  }
}
```

### Test 3: Test with Stripe Test Cards

Use these test card numbers:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires authentication:** 4000 0025 0000 3155

---

## 🔧 Setting Up Stripe Webhook (Local Development)

### Step 1: Install Stripe CLI

```bash
# Windows (with Scoop)
scoop install stripe

# Mac
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Step 2: Login to Stripe CLI

```bash
stripe login
```

### Step 3: Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/api/v1/payment/webhook
```

This will output:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy this webhook secret** and add it to your `.env` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 4: Test Webhook

In another terminal, trigger a test webhook:

```bash
stripe trigger payment_intent.succeeded
```

Check your server logs - you should see:
```
Webhook received: payment_intent.succeeded
Payment succeeded for appointment xxx
```

---

## 📊 API Endpoints

All endpoints are prefixed with `/api/v1/payment`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/config` | Get Stripe publishable key | No |
| POST | `/webhook` | Stripe webhook handler | No (signature verified) |
| POST | `/create-intent` | Create payment intent | Yes |
| POST | `/confirm` | Confirm payment status | Yes |
| GET | `/:appointmentId` | Get payment details | Yes |
| GET | `/history` | Get payment history | Yes (Patient only) |
| POST | `/:paymentIntentId/cancel` | Cancel payment | Yes |
| POST | `/:paymentId/refund` | Create refund | Yes (Admin/Doctor) |

---

## 🔐 Security Features

✅ **Implemented Security:**
- Payment intents prevent double charging
- Webhook signature verification
- User authentication required
- Authorization checks (patient owns payment)
- Idempotency with appointmentId
- HTTPS only in production

---

## 🐛 Troubleshooting

### Issue: "Stripe is not defined"

**Solution:**
```bash
npm install stripe
npm run prisma:generate
# Restart your server
```

### Issue: "Webhook signature verification failed"

**Solution:**
1. Make sure Stripe CLI is running: `stripe listen --forward-to ...`
2. Copy the webhook secret from CLI output
3. Update `.env` with the new secret
4. Restart your server

### Issue: "Payment model not found"

**Solution:**
```bash
npm run prisma:generate
npx prisma migrate dev
```

### Issue: "Cannot POST /api/v1/payment/create-intent"

**Solution:**
- Make sure you registered the routes in `index.ts`
- Check if server restarted after adding routes
- Verify the route path is correct

---

## 📝 Next Steps - Frontend Integration

Now that the backend is ready, we need to create:

1. **Frontend Payment Service** - API calls
2. **Payment Component** - Payment page UI
3. **Stripe Elements Form** - Card input form
4. **Payment Success/Failure Pages**

**Ready to continue with frontend?** Let me know and I'll create all the Angular components! 🚀

---

## 💡 Quick Start Checklist

- [ ] Install Stripe: `npm install stripe`
- [ ] Add Stripe keys to `.env`
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Register routes in `index.ts`
- [ ] Restart backend server
- [ ] Test config endpoint
- [ ] Install Stripe CLI (optional, for webhooks)
- [ ] Test with Stripe test cards

---

**Backend is DONE! ✅ Ready for frontend integration!**
