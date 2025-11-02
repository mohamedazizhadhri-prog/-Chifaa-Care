# 🧪 QUICK TESTING CHECKLIST - 3-STEP PAYMENT FLOW

## ✅ Pre-Flight Checks

Before testing, make sure:

```bash
□ Backend is running (npm run dev in chifaacare-backend)
□ Frontend is running (npm start)
□ Stripe webhook is running (stripe listen --forward-to...)
□ Stripe keys are set in environment.ts and .env
□ You're logged in as a PATIENT (not doctor)
```

---

## 📝 Test Checklist

### ✅ TEST 1: Open Booking Modal
```
Steps:
1. Go to http://localhost:4200/patient/book-consultation
2. Click any doctor's "Book Now" button

Expected Results:
□ Modal opens
□ Shows "Step 1: Appointment Details"
□ Progress bar shows: ○━━━━○━━━━○ (Step 1 active)
□ Blue info banner shows consultation fee
□ Form has: Type, Date, Time, Reason fields
□ "Next: Payment" button is DISABLED (form empty)
```

---

### ✅ TEST 2: Fill Booking Form
```
Steps:
1. Select consultation type: Video Call
2. Enter date: Tomorrow's date
3. Enter time: 14:00
4. Enter reason: "Regular checkup"

Expected Results:
□ All fields filled correctly
□ "Next: Payment" button becomes ENABLED
□ Date cannot be in the past
□ Time shows in 24-hour format
```

---

### ✅ TEST 3: Move to Payment Step
```
Steps:
1. Click "Next: Payment" button

Expected Results:
□ Button shows "Creating Appointment..."
□ Progress bar moves: ●━━━━○━━━━○ (Step 1 complete, Step 2 active)
□ Modal title changes to "Step 2: Payment"
□ Appointment summary shows:
  - Doctor name
  - Date and time
  - Consultation type
  - Total amount
□ Stripe card element appears
□ "Back" and "Pay $XX.XX" buttons visible
```

---

### ✅ TEST 4: Enter Payment Information
```
Steps:
1. Click on card number field
2. Enter: 4242 4242 4242 4242
3. Enter expiry: 12/25
4. Enter CVC: 123
5. Enter ZIP: 12345

Expected Results:
□ Card number formats as you type
□ No validation errors
□ Card element has blue focus border
□ "Pay $XX.XX" button is enabled
```

---

### ✅ TEST 5: Complete Payment
```
Steps:
1. Click "Pay $XX.XX" button

Expected Results:
□ Button shows "Processing Payment..."
□ Button is disabled during processing
□ After 2-3 seconds:
  □ Progress bar: ●━━━━●━━━━● (All steps complete)
  □ Modal title: "Booking Confirmed!"
  □ Big green checkmark appears
  □ Shows "Payment Successful!"
  □ Shows payment details:
    - Payment ID
    - Amount paid
    - Doctor name
    - Date & time
□ "View My Appointments" button visible
```

---

### ✅ TEST 6: Navigate to Appointments
```
Steps:
1. Click "View My Appointments"

Expected Results:
□ Modal closes
□ Redirects to /patient/appointments
□ New appointment appears in list
□ Appointment status: CONFIRMED
```

---

### ✅ TEST 7: Verify Database
```
Check database:
□ Appointment record exists
□ Appointment status = "CONFIRMED"
□ Payment record exists
□ Payment status = "SUCCEEDED"
□ Payment amount matches consultation fee
```

---

## ❌ Negative Tests

### ✅ TEST 8: Form Validation
```
Steps:
1. Open booking modal
2. Try to click "Next: Payment" with empty form

Expected Results:
□ Button is disabled
□ Cannot proceed to payment
```

---

### ✅ TEST 9: Payment Decline
```
Steps:
1. Fill booking form
2. Go to payment step
3. Enter card: 4000 0000 0000 0002 (Decline card)
4. Click "Pay"

Expected Results:
□ Error message appears below card
□ "Your card was declined"
□ Can try again with different card
□ Stays on payment step
```

---

### ✅ TEST 10: Back Button
```
Steps:
1. Fill booking form
2. Go to payment step
3. Click "← Back" button

Expected Results:
□ Returns to Step 1
□ Form data is preserved
□ Can edit details
□ Can proceed to payment again
```

---

### ✅ TEST 11: Modal Close Protection
```
Steps:
1. Fill booking form
2. Go to payment step
3. Try to close modal (X button)

Expected Results:
□ Confirmation dialog appears
□ "Payment is in progress. Are you sure?"
□ Can cancel or confirm close
```

---

## 🔍 Console Checks

### Browser Console Should Show:
```javascript
✓ BookConsultationComponent: ngOnInit called
✓ BookConsultationComponent: Doctors received from service
✓ Appointment created for payment: {...}
✓ Stripe loaded successfully
✓ Payment intent created: {...}
✓ Payment confirmed: {...}

❌ No errors (check for red text)
```

### Network Tab Should Show:
```
✓ POST /api/v1/appointments/book → 201 Created
✓ GET /api/v1/payment/config → 200 OK
✓ POST /api/v1/payment/create-intent → 200 OK
✓ POST /api/v1/payment/confirm → 200 OK
```

### Stripe CLI Should Show:
```
✓ Webhook received: payment_intent.succeeded
✓ Webhook processed successfully
✓ Appointment updated to CONFIRMED
```

---

## 🐛 Common Issues & Fixes

### Issue: Card element not showing
```bash
Fix:
1. Check browser console for Stripe errors
2. Verify publishable key in environment.ts
3. Clear browser cache
4. Restart frontend: npm start
```

### Issue: "Appointment not created"
```bash
Fix:
1. Check backend is running
2. Verify JWT token is valid
3. Check backend logs for errors
4. Verify patient is logged in
```

### Issue: "Payment succeeds but appointment not confirmed"
```bash
Fix:
1. Check Stripe webhook is running
2. Verify webhook secret in .env
3. Check backend logs for webhook errors
4. Restart backend after updating .env
```

### Issue: Modal not opening
```bash
Fix:
1. Check browser console
2. Verify NgbModal is imported
3. Check if doctor has doctorProfile
4. Clear browser cache
```

---

## 📊 Success Criteria

Your implementation is successful if:

```
✅ All 11 tests pass
✅ No errors in browser console
✅ All network requests return 200/201
✅ Webhook processes successfully
✅ Appointment created in database
✅ Payment recorded in database
✅ UI is smooth and responsive
✅ User can complete booking in <2 minutes
```

---

## 🎯 Testing Script

Run through this quickly:

```
1. Open booking page                     → 5 seconds
2. Select doctor → Click "Book Now"      → 5 seconds
3. Fill form (Video, date, time, reason) → 20 seconds
4. Click "Next: Payment"                 → 3 seconds
5. Enter card details                    → 15 seconds
6. Click "Pay"                           → 5 seconds
7. See success → Click "View"            → 5 seconds

Total time: ~1 minute
```

---

## 📝 Test Report Template

Use this to track your testing:

```
Date: ___________
Tester: ___________

STEP 1 - Booking Details:  □ Pass  □ Fail
STEP 2 - Payment:           □ Pass  □ Fail
STEP 3 - Confirmation:      □ Pass  □ Fail

Form Validation:            □ Pass  □ Fail
Payment Decline:            □ Pass  □ Fail
Back Button:                □ Pass  □ Fail
Modal Protection:           □ Pass  □ Fail

Database Records:           □ Pass  □ Fail
Webhook Processing:         □ Pass  □ Fail

Issues Found:
_________________________________
_________________________________
_________________________________

Overall Status:  □ PASS  □ FAIL

Notes:
_________________________________
_________________________________
```

---

## 🚀 Production Readiness Checklist

Before going live:

```
□ Switch to live Stripe keys
□ Setup production webhook endpoint
□ Enable HTTPS (required for Stripe)
□ Test with real cards (small amounts)
□ Setup error monitoring (Sentry, etc.)
□ Add email notifications
□ Test on mobile devices
□ Test on different browsers
□ Load test with multiple users
□ Backup database
□ Document cancellation process
□ Train support staff
```

---

**TESTING COMPLETE!** 🎉

If all tests pass, your payment system is ready to use!
