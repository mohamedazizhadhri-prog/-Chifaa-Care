# ⚡ Quick Setup Checklist

## ✅ What's Already Done

- [x] Payment-to-Pending workflow implemented
- [x] Doctor accept/reject endpoints created
- [x] Google Calendar OAuth setup
- [x] Calendar sync service implemented
- [x] Refund logic for rejected appointments
- [x] All routes registered in backend
- [x] Database schema ready

## 🔧 What You Need to Do Now

### Step 1: Google Cloud Console (5 minutes)

1. [ ] Go to https://console.cloud.google.com/
2. [ ] Create project or select existing
3. [ ] Enable "Google Calendar API"
4. [ ] Create OAuth 2.0 Client ID
   - [ ] Application type: Web application
   - [ ] Authorized redirect URIs:
     ```
     http://localhost:3000/api/v1/calendar/oauth/callback
     http://localhost:4200/doctor/calendar/callback
     ```
5. [ ] Copy Client ID and Client Secret

### Step 2: Update Backend .env (2 minutes)

```bash
cd chifaacare-backend
```

Edit `.env` file:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/calendar/oauth/callback
```

### Step 3: Install Dependencies (1 minute)

```bash
npm install googleapis @google-cloud/local-auth
```

### Step 4: Database Migration (1 minute)

```bash
npx prisma migrate deploy
# or
npx prisma generate
```

### Step 5: Start Backend (1 minute)

```bash
npm run dev
```

Check console for:
```
✅ Server is running on port 3000
✅ Calendar routes registered
```

### Step 6: Test Backend (5 minutes)

#### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```
Expected: `{ "status": "ok" }`

#### Test 2: Create Appointment (as Patient)
```bash
curl -X POST http://localhost:3000/api/v1/appointments \
  -H "Authorization: Bearer <patient_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "doctor-uuid",
    "appointmentDate": "2025-11-10T10:00:00Z",
    "endTime": "2025-11-10T11:00:00Z",
    "reason": "Test consultation"
  }'
```
Expected: `status: "PENDING"`

#### Test 3: Get Pending Appointments (as Doctor)
```bash
curl http://localhost:3000/api/v1/appointments/doctor/pending \
  -H "Authorization: Bearer <doctor_token>"
```
Expected: List of pending appointments

### Step 7: Create Frontend Components (30 minutes)

#### Component 1: Pending Appointments List
```bash
cd src/app/portals/doctor
ng generate component pending-appointments
```

Copy code from `APPOINTMENT_WORKFLOW_COMPLETE.md` → Section "Frontend Integration Needed" → "1. Doctor Pending Appointments Component"

#### Component 2: Calendar Settings
```bash
ng generate component calendar-settings
```

Copy code from `APPOINTMENT_WORKFLOW_COMPLETE.md` → Section "Frontend Integration Needed" → "2. Google Calendar Connection Component"

#### Component 3: Calendar Callback Handler
```bash
ng generate component calendar-callback
```

Copy code from `APPOINTMENT_WORKFLOW_COMPLETE.md` → Section "Frontend Integration Needed" → "3. Calendar Callback Handler"

### Step 8: Update Router (2 minutes)

Edit `src/app/app-routing.module.ts` or doctor routes:

```typescript
{
  path: 'doctor',
  children: [
    { path: 'pending', component: PendingAppointmentsComponent },
    { path: 'calendar-settings', component: CalendarSettingsComponent },
    { path: 'calendar/callback', component: CalendarCallbackComponent }
  ]
}
```

### Step 9: Add to Doctor Navigation (2 minutes)

Edit doctor sidebar/navigation:

```html
<nav>
  <a routerLink="/doctor/dashboard">Dashboard</a>
  <a routerLink="/doctor/pending">
    Pending Requests
    <span *ngIf="pendingCount > 0" class="badge">{{pendingCount}}</span>
  </a>
  <a routerLink="/doctor/appointments">Appointments</a>
  <a routerLink="/doctor/calendar-settings">Calendar Settings</a>
</nav>
```

### Step 10: Test Complete Flow (10 minutes)

1. [ ] **Patient books appointment**
   - Go to booking page
   - Select doctor, date, time
   - Click "Book Appointment"
   - Status should be: "PENDING"

2. [ ] **Patient pays**
   - Enter payment details
   - Complete payment
   - Status should STILL be: "PENDING" (awaiting doctor)

3. [ ] **Doctor connects calendar**
   - Login as doctor
   - Go to Calendar Settings
   - Click "Connect Google Calendar"
   - Authorize in Google
   - Should show: "✅ Connected"

4. [ ] **Doctor views pending**
   - Go to Pending Appointments
   - Should see the paid appointment
   - Patient details visible
   - Payment status: "SUCCEEDED"

5. [ ] **Doctor accepts**
   - Click "Accept" button
   - Should show success message
   - Status changes to: "CONFIRMED"
   - Check Google Calendar → Event should appear

6. [ ] **Verify calendar event**
   - Open doctor's Google Calendar
   - Event title: "Consultation with [Patient Name]"
   - Date/time matches appointment
   - Patient email in attendees

## 🐛 Troubleshooting

### Issue: "Calendar not connecting"

**Check:**
```bash
# 1. Verify environment variables
cat chifaacare-backend/.env | grep GOOGLE

# 2. Check OAuth redirect URI matches exactly
# In Google Cloud Console: Must match .env value
# No trailing slashes, ports must match

# 3. Check token in database
# Login to your database and check:
SELECT id, email, googleCalendarToken FROM "User" WHERE role = 'DOCTOR';
# Token should be NULL if not connected
```

**Fix:**
1. Verify OAuth credentials in Google Console
2. Check redirect URI is whitelisted
3. Try disconnecting and reconnecting

### Issue: "Appointments auto-confirming after payment"

**Check:**
```bash
# Open stripe.service.ts
# Line ~170: handlePaymentSucceeded function
# Should NOT update appointment status to CONFIRMED
```

**Expected code:**
```typescript
// ✅ CORRECT - Keeps PENDING
await prisma.appointment.update({
  where: { id: payment.appointmentId },
  data: { updatedAt: new Date() } // No status change
});

// ❌ WRONG - Auto-confirms
await prisma.appointment.update({
  where: { id: payment.appointmentId },
  data: { status: 'CONFIRMED' } // This should NOT be here
});
```

### Issue: "Doctor can't see pending appointments"

**Check:**
```bash
# 1. Verify endpoint is working
curl http://localhost:3000/api/v1/appointments/doctor/pending \
  -H "Authorization: Bearer <doctor_token>"

# 2. Check database
# Login to database:
SELECT 
  a.id, 
  a.status, 
  p.status as payment_status,
  a.appointmentDate
FROM "Appointment" a
LEFT JOIN "Payment" p ON p.appointmentId = a.id
WHERE a.doctorId = '<doctor-uuid>';

# 3. Verify payment succeeded
# Payment status should be "SUCCEEDED"
# Appointment status should be "PENDING"
```

### Issue: "Accept button not working"

**Check:**
```bash
# Test endpoint directly
curl -X POST http://localhost:3000/api/v1/appointments/<appointment-id>/accept \
  -H "Authorization: Bearer <doctor_token>"

# Check response
# Should return: status: "CONFIRMED" + calendarEvent details
```

**Common causes:**
1. Missing Authorization header
2. Wrong appointment ID
3. Appointment not in PENDING status
4. Payment not succeeded
5. Doctor doesn't own appointment

### Issue: "Refund not working when rejecting"

**Check:**
```bash
# 1. Verify Stripe is configured (not mock mode)
cat .env | grep STRIPE_SECRET_KEY
# Should start with sk_test_ or sk_live_

# 2. Test reject endpoint
curl -X POST http://localhost:3000/api/v1/appointments/<id>/reject \
  -H "Authorization: Bearer <doctor_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Not available"}'

# 3. Check Stripe dashboard
# Go to: https://dashboard.stripe.com/test/payments
# Should see refund listed
```

## 📊 Verification Commands

### Check Current Status

```sql
-- View appointment statuses
SELECT status, COUNT(*) 
FROM "Appointment" 
GROUP BY status;

-- View payment statuses  
SELECT status, COUNT(*)
FROM "Payment"
GROUP BY status;

-- Find mismatched states (appointments confirmed but payment pending)
SELECT a.id, a.status, p.status as payment_status
FROM "Appointment" a
LEFT JOIN "Payment" p ON p.appointmentId = a.id
WHERE a.status = 'CONFIRMED' AND p.status != 'SUCCEEDED';
```

### Monitor Real-Time Logs

```bash
# Terminal 1: Backend logs
cd chifaacare-backend
npm run dev

# Terminal 2: Watch appointments
watch -n 2 "curl -s http://localhost:3000/api/v1/appointments/doctor/pending \
  -H 'Authorization: Bearer <token>' | jq '.data.appointments | length'"
```

## ✅ Success Criteria

Your system is working correctly when:

- [ ] Patient can book and pay
- [ ] Appointment stays PENDING after payment
- [ ] Doctor sees appointment in pending list
- [ ] Payment status shows "SUCCEEDED"
- [ ] Doctor can accept → Status becomes CONFIRMED
- [ ] Calendar event appears in Google Calendar
- [ ] Doctor can reject → Refund initiated
- [ ] Patient receives appropriate notifications
- [ ] Rescheduling updates calendar event
- [ ] Canceling removes calendar event

## 📞 Need Help?

Check these files for details:
1. `APPOINTMENT_WORKFLOW_COMPLETE.md` - Full implementation guide
2. `WORKFLOW_VISUAL_GUIDE.md` - Visual diagrams and flows
3. `GOOGLE-CALENDAR-APPOINTMENT-SYSTEM.md` - Original documentation

Backend files to review:
- `src/controllers/appointment.controller.ts` - Accept/Reject logic
- `src/services/stripe.service.ts` - Payment flow (line ~170)
- `src/services/google-calendar.service.ts` - Calendar integration
- `src/routes/appointment.routes.ts` - API endpoints

## 🚀 Quick Start Script

Save this as `setup.sh`:

```bash
#!/bin/bash

echo "🚀 ChifaaCare Appointment System Setup"
echo "======================================"

# Check if in correct directory
if [ ! -f "chifaacare-backend/package.json" ]; then
    echo "❌ Error: Run from project root"
    exit 1
fi

cd chifaacare-backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install googleapis @google-cloud/local-auth

# Check .env file
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

# Check for Google credentials
if ! grep -q "GOOGLE_CLIENT_ID" .env || [ "$(grep GOOGLE_CLIENT_ID .env | cut -d '=' -f2)" == "" ]; then
    echo "⚠️  Warning: GOOGLE_CLIENT_ID not set in .env"
    echo "   Please add your Google OAuth credentials"
fi

# Database migration
echo "🗄️  Running database migrations..."
npx prisma generate

# Start server
echo "🚀 Starting server..."
npm run dev
```

Make executable:
```bash
chmod +x setup.sh
./setup.sh
```

---

**Last Updated**: November 5, 2025  
**Estimated Total Time**: ~1 hour  
**Difficulty**: Easy (mostly copy-paste)
