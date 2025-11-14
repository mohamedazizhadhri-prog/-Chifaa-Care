# 🧪 Testing the Appointment Confirmation System

## Complete Test Scenarios

---

## ✅ Test Scenario 1: Accept Appointment (Happy Path)

### Prerequisites:
- Backend running on http://localhost:3000
- Frontend running on http://localhost:4200
- At least one doctor and one patient account

### Steps:

#### 1. Patient Books Appointment
```
1. Login as patient
   Email: patient@test.com
   Password: password123

2. Navigate to book appointment page
   http://localhost:4200/patient/book-appointment

3. Select a doctor from the list

4. Choose appointment details:
   - Date: Tomorrow
   - Time: 2:00 PM
   - Reason: "Annual checkup"
   - Consultation Type: "General Consultation"

5. Click "Continue to Payment"

6. Enter test card details:
   Card Number: 4242 4242 4242 4242
   Expiry: 12/25
   CVC: 123
   ZIP: 12345

7. Click "Pay $50.00"

8. ✅ Success! You should see:
   "Payment successful! Your appointment is pending doctor approval."
```

#### 2. Doctor Reviews Request
```
1. Logout from patient account

2. Login as doctor
   Email: doctor@test.com
   Password: password123

3. Navigate to patients page
   http://localhost:4200/doctor/patients

4. You should see a YELLOW card with:
   - Patient name: "Patient Test"
   - Date: Tomorrow at 2:00 PM
   - Reason: "Annual checkup"
   - Three buttons: Accept, Refuse, Reschedule
```

#### 3. Doctor Accepts
```
1. Click the green "✅ Accept" button

2. Confirm the action in the dialog

3. ✅ Success! You should see:
   "Appointment accepted successfully! The patient will be notified."

4. The yellow card should disappear from pending

5. A GREEN card should appear in confirmed section with:
   - Patient name
   - Confirmed date and time
```

#### 4. Verify in Database
```sql
-- Check appointment status
SELECT id, status, patientId, doctorId, appointmentDate 
FROM "Appointment" 
WHERE status = 'CONFIRMED';

-- Check payment status
SELECT id, status, amount, appointmentId
FROM "Payment"
WHERE status = 'SUCCEEDED';
```

**Expected Results:**
- ✅ Appointment status: CONFIRMED
- ✅ Payment status: SUCCEEDED
- ✅ Doctor sees appointment in confirmed list
- ✅ Patient sees appointment as confirmed

---

## ❌ Test Scenario 2: Reject Appointment (Refund Path)

### Steps:

#### 1. Patient Books Another Appointment
```
Follow steps from Scenario 1 to create a new appointment
```

#### 2. Doctor Rejects
```
1. Login as doctor (if not already logged in)

2. Go to http://localhost:4200/doctor/patients

3. You should see the new pending appointment

4. Click the red "❌ Refuse" button

5. A prompt appears asking for reason

6. Enter reason: "Schedule conflict - fully booked"

7. Click OK

8. ✅ Success! You should see:
   "Appointment rejected. A refund has been initiated for the patient."

9. The yellow card should disappear completely
```

#### 3. Verify Refund
```
# Check console logs in backend
# You should see:
[MockPayment] Creating mock refund
[MockPayment] Refund created successfully

# Or for real Stripe:
Stripe refund created: re_abc123...
```

#### 4. Check Database
```sql
-- Check appointment status
SELECT id, status, notes
FROM "Appointment"
WHERE status = 'CANCELLED'
ORDER BY updatedAt DESC
LIMIT 1;

-- Check payment status (should be REFUNDED)
SELECT id, status, amount
FROM "Payment"
WHERE status = 'REFUNDED'
ORDER BY updatedAt DESC
LIMIT 1;
```

**Expected Results:**
- ❌ Appointment status: CANCELLED
- 💰 Payment status: REFUNDED
- 📝 Appointment notes include rejection reason
- ✅ Patient can book with another doctor

---

## 📅 Test Scenario 3: Reschedule Appointment

### Steps:

#### 1. Patient Books Appointment
```
Create another test appointment (follow Scenario 1)
```

#### 2. Doctor Reschedules
```
1. Login as doctor

2. Go to http://localhost:4200/doctor/patients

3. Click "📅 Reschedule" button on pending appointment

4. A modal opens

5. Change date to: Day after tomorrow

6. Change time to: 3:00 PM

7. Click "Save"

8. ✅ Modal closes, appointment stays in pending with new time

9. Patient should see updated time (refresh their page)
```

**Expected Results:**
- 🔄 Appointment time updated
- ⏳ Status remains PENDING
- ✅ Patient sees new time

---

## 🔴 Test Scenario 4: Error Handling

### Test 4.1: Accept Without Payment
```
# Manually update appointment in database to have no payment
UPDATE "Appointment" SET id = 'test-no-payment-id' WHERE id = '<some_id>';

# Try to accept - should fail with:
"Cannot accept appointment without successful payment"
```

### Test 4.2: Accept Already Confirmed
```
# Try to accept an already confirmed appointment
# Should show:
"Cannot accept appointment with status CONFIRMED"
```

### Test 4.3: Reject Already Cancelled
```
# Try to reject an already cancelled appointment
# Should show:
"Cannot reject appointment with status CANCELLED"
```

### Test 4.4: Wrong Doctor Tries to Accept
```
# Login as different doctor
# Try to accept another doctor's appointment
# Should show:
"Unauthorized to accept this appointment"
```

---

## 🌐 Browser Console Tests

### Check Network Requests

#### Accept Request
```javascript
// Open browser console (F12)
// Watch Network tab
// Click Accept button
// You should see:

POST http://localhost:3000/api/v1/appointments/<id>/accept
Status: 200 OK
Response: {
  status: "success",
  data: {
    appointment: {
      status: "CONFIRMED",
      ...
    }
  },
  message: "Appointment accepted successfully"
}
```

#### Reject Request
```javascript
POST http://localhost:3000/api/v1/appointments/<id>/reject
Status: 200 OK
Body: { reason: "Schedule conflict" }
Response: {
  status: "success",
  data: {
    appointment: {
      status: "CANCELLED",
      ...
    },
    refund: {
      id: "re_...",
      amount: 5000,
      status: "PENDING"
    }
  },
  message: "Appointment rejected and refund initiated"
}
```

---

## 📊 Load Testing

### Test with Multiple Appointments
```
1. Create 10 patient accounts
2. Book 10 appointments with same doctor
3. Login as doctor
4. Should see all 10 in pending list
5. Accept 5, reject 3, reschedule 2
6. Verify all actions complete successfully
7. Check database consistency
```

---

## 🔒 Security Testing

### Test 1: Invalid JWT Token
```bash
# Try to accept with invalid token
curl -X POST http://localhost:3000/api/v1/appointments/<id>/accept \
  -H "Authorization: Bearer invalid_token"

# Expected: 401 Unauthorized
```

### Test 2: Patient Tries to Accept
```bash
# Login as patient, get JWT
# Try to accept appointment

# Expected: 403 Forbidden - "Only doctors or admins can accept"
```

### Test 3: SQL Injection
```bash
# Try SQL injection in reason field
{
  "reason": "'; DROP TABLE Appointment; --"
}

# Expected: Prisma should sanitize automatically
```

---

## 🎭 Role-Based Testing

### Admin User Test
```
1. Create admin account:
   - Role: ADMIN
   - Email: admin@test.com

2. Login as admin

3. Navigate to /doctor/patients

4. Should see ALL doctors' pending appointments

5. Can accept/reject any appointment

6. No restrictions on doctor ownership
```

### Doctor User Test
```
1. Login as doctor

2. Can only see their own appointments

3. Cannot see other doctors' appointments

4. Cannot accept/reject other doctors' appointments
```

### Patient User Test
```
1. Login as patient

2. Cannot access /doctor/patients route

3. Should redirect to patient dashboard

4. Can only view/cancel their own appointments
```

---

## 📱 Mobile Testing

### Test on Mobile Devices
```
1. Open http://localhost:4200/doctor/patients on phone

2. Pending cards should be responsive

3. Buttons should be large enough to tap

4. Modal should work on small screens

5. No horizontal scrolling

6. Touch interactions work smoothly
```

---

## 🔄 Integration Testing

### Test Full Workflow
```
1. Patient books → Status: PENDING
2. Payment succeeds → Payment: SUCCEEDED
3. Doctor accepts → Status: CONFIRMED
4. Appointment happens → Status: COMPLETED

OR

1. Patient books → Status: PENDING
2. Payment succeeds → Payment: SUCCEEDED
3. Doctor rejects → Status: CANCELLED
4. Refund initiated → Payment: REFUNDED
5. Patient can rebook
```

---

## 📈 Performance Testing

### Measure Response Times
```javascript
// Measure accept endpoint
console.time('accept');
await appointmentService.acceptAppointment(id);
console.timeEnd('accept');

// Expected: < 500ms
```

### Database Query Performance
```sql
-- Check slow queries
EXPLAIN ANALYZE 
SELECT * FROM "Appointment" 
WHERE doctorId = '<id>' 
  AND status = 'PENDING';

-- Should use index, < 100ms
```

---

## 🎯 Success Criteria Checklist

### ✅ Functional Tests
- [ ] Patient can book appointment
- [ ] Doctor sees pending request
- [ ] Doctor can accept appointment
- [ ] Doctor can reject appointment
- [ ] Refund is created on rejection
- [ ] Reschedule updates appointment time
- [ ] Status changes correctly
- [ ] UI updates in real-time

### ✅ Security Tests
- [ ] JWT authentication required
- [ ] Role-based access control works
- [ ] Only assigned doctor can accept
- [ ] SQL injection prevented
- [ ] XSS attacks prevented

### ✅ Error Handling Tests
- [ ] Invalid payment fails gracefully
- [ ] Duplicate actions prevented
- [ ] Clear error messages shown
- [ ] Backend logs errors properly

### ✅ Performance Tests
- [ ] Accept/reject < 500ms
- [ ] Page loads < 2s
- [ ] No memory leaks
- [ ] Database queries optimized

### ✅ UI/UX Tests
- [ ] Responsive on mobile
- [ ] Accessible (ARIA labels)
- [ ] Clear visual feedback
- [ ] Intuitive button placement

---

## 🚀 Automated Test Script

```bash
# Save as test-appointment-flow.sh

#!/bin/bash

echo "🧪 Testing Appointment Confirmation System"
echo "=========================================="

# 1. Test accept endpoint
echo "Testing accept endpoint..."
curl -X POST http://localhost:3000/api/v1/appointments/test-id/accept \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json"

# 2. Test reject endpoint
echo "Testing reject endpoint..."
curl -X POST http://localhost:3000/api/v1/appointments/test-id/reject \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Testing"}'

# 3. Check database
echo "Checking database..."
psql $DATABASE_URL -c "SELECT status FROM Appointment WHERE id='test-id';"

echo "✅ Tests complete!"
```

---

## 📝 Test Report Template

```markdown
# Test Report: Appointment Confirmation System

Date: YYYY-MM-DD
Tester: Your Name
Version: 1.0.0

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| Accept appointment | ✅ Pass | Works as expected |
| Reject appointment | ✅ Pass | Refund created |
| Reschedule | ✅ Pass | Time updated |
| Error handling | ✅ Pass | Clear messages |
| Security | ✅ Pass | Auth working |

## Issues Found
- None

## Recommendations
- Add email notifications
- Add SMS alerts
- Improve mobile UI

## Overall: ✅ PASS
```

---

## 🎬 Demo Video Script

```
1. "Hi, I'm going to show you our appointment confirmation system"
2. Book appointment as patient (show payment)
3. Switch to doctor account
4. Show pending request in yellow card
5. Click Accept - show success message
6. Show confirmed appointment in green
7. Book another appointment
8. Click Reject - enter reason
9. Show refund initiated message
10. "That's it! Doctors can easily manage appointments"
```

---

**Ready to test! 🚀**

Follow these scenarios to thoroughly test your appointment confirmation system.
