# 🔍 Debug Pending Appointments - Step by Step

## Issue: Pending appointments still not showing at /doctor/patients

Let's debug this systematically:

---

## 🔧 Step 1: Verify Backend Fix is Applied

1. **Check the file was updated:**
   ```
   Open: chifaacare-backend/src/controllers/payment.controller.ts
   Line ~97-110 should look like this:
   ```
   
   ```typescript
   // Payment successful - appointment stays PENDING until doctor accepts
   if (result.payment.status === 'SUCCEEDED' && result.payment.appointmentId) {
     console.log('[confirmPayment] Payment succeeded for appointment:', result.payment.appointmentId);
     console.log('[confirmPayment] Appointment remains PENDING - awaiting doctor confirmation');
   }
   ```
   
   **It should NOT have:**
   ```typescript
   data: { status: 'CONFIRMED' }  // ❌ This should be removed
   ```

2. **Restart backend completely:**
   ```bash
   # Stop the backend (Ctrl+C)
   cd chifaacare-backend
   npm run build
   npm run dev
   ```

---

## 🔍 Step 2: Check Database Status

Let's see what appointments actually exist:

### Option A: Using Prisma Studio (Easiest)
```bash
cd chifaacare-backend
npx prisma studio
```

Then:
1. Click on "Appointment" table
2. Look at the "status" column
3. Check if any appointments have status = "PENDING"
4. Check the "doctorId" matches your doctor's user ID

### Option B: Using Database Query
If you have direct database access:
```sql
SELECT 
  id, 
  status, 
  doctorId, 
  patientId, 
  appointmentDate,
  createdAt
FROM "Appointment"
WHERE status = 'PENDING'
ORDER BY createdAt DESC;
```

---

## 🧪 Step 3: Test Fresh Booking

Let's create a test appointment from scratch:

### 3.1 Book Appointment as Patient
1. Login as patient
2. Go to "Book Consultation"
3. Select ANY doctor
4. Fill in:
   - Date: Tomorrow's date
   - Time: 10:00 AM
   - Reason: "Test booking for debugging"
   - Consultation Type: Video

5. Click "Continue to Payment"

### 3.2 Check Backend Logs
**After clicking "Continue"**, backend should show:
```
[createAppointment] incoming body: {...}
[createAppointment] No conflicts found. Creating appointment...
[createAppointment] Appointment created successfully:
[createAppointment] Status: PENDING    ← SHOULD SEE THIS
```

### 3.3 Make Payment
Use test card: `4242 4242 4242 4242`

**After payment**, backend should show:
```
[confirmPayment] Payment succeeded for appointment: <id>
[confirmPayment] Appointment remains PENDING - awaiting doctor confirmation   ← CRITICAL
```

**It should NOT show:**
```
[confirmPayment] Updating appointment status to CONFIRMED   ← WRONG (old code)
```

### 3.4 Verify in Database
Open Prisma Studio again and refresh - the new appointment should have:
- status: "PENDING"
- Payment exists with status: "SUCCEEDED"

---

## 🩺 Step 4: Check Doctor Dashboard

### 4.1 Login as Doctor
1. Logout from patient account
2. Login with doctor credentials
3. Navigate to: http://localhost:4200/doctor/patients

### 4.2 Open Browser Console (F12)
Look for these logs:
```
Loading pending appointments for doctor: <doctor-id>
[getAppointments] Query params: {status: 'PENDING', doctorId: '<id>'}
[getAppointments] User: {userId: '<id>', userRole: 'DOCTOR'}
Received pending appointments: [...]
Number of pending appointments: X
```

### 4.3 Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for request to: `appointments?doctorId=...&status=PENDING`
5. Click on it and check:
   - **Request**: Should have doctorId and status=PENDING
   - **Response**: Should show appointments array

---

## 🔍 Step 5: Common Issues & Solutions

### Issue 1: Wrong Doctor ID
**Symptom:** Console shows different doctor ID than expected

**Solution:**
```typescript
// Check current user in browser console:
const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
console.log('Current user:', user);
console.log('Doctor ID:', user.id);
console.log('Role:', user.role);
```

### Issue 2: Role Mismatch
**Symptom:** Error "User is not a doctor"

**Solution:**
- User role might be lowercase 'doctor' instead of 'DOCTOR'
- The code handles both, but check:
```typescript
console.log('Role:', currentUser.role);
console.log('Role uppercase:', currentUser.role?.toUpperCase());
```

### Issue 3: No Appointments in Database
**Symptom:** Database query returns empty

**Solution:**
- Create a fresh appointment
- Make sure payment completes
- Check backend doesn't auto-confirm it

### Issue 4: Backend Not Updated
**Symptom:** Backend still shows old logs

**Solution:**
```bash
# Hard reset:
cd chifaacare-backend
rm -rf dist node_modules
npm install
npm run build
npm run dev
```

### Issue 5: Frontend Not Calling Backend
**Symptom:** No network requests in DevTools

**Solution:**
- Check if AuthService has valid token
- Check if user is actually logged in
- Try logging out and logging back in

---

## 🎯 Quick Test Script

Run this in browser console when on /doctor/patients:

```javascript
// 1. Check current user
const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
console.log('=== USER INFO ===');
console.log('ID:', user.id);
console.log('Role:', user.role);
console.log('Name:', user.firstName, user.lastName);

// 2. Check token
const token = localStorage.getItem('token');
console.log('=== TOKEN ===');
console.log('Exists:', !!token);
console.log('Length:', token?.length);

// 3. Manually fetch appointments
fetch(`http://localhost:3000/api/v1/appointments?doctorId=${user.id}&status=PENDING`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== APPOINTMENTS ===');
  console.log('Status:', data.status);
  console.log('Results:', data.results);
  console.log('Appointments:', data.data?.appointments);
})
.catch(err => {
  console.error('=== ERROR ===', err);
});
```

---

## 📋 Debugging Checklist

Go through this checklist:

- [ ] Backend file `payment.controller.ts` has the fix applied
- [ ] Backend has been rebuilt (`npm run build`)
- [ ] Backend has been restarted (`npm run dev`)
- [ ] Created a new test appointment as patient
- [ ] Payment completed successfully
- [ ] Backend logs show "Appointment remains PENDING"
- [ ] Database shows appointment with status='PENDING'
- [ ] Database shows payment with status='SUCCEEDED'
- [ ] Logged in as doctor (not patient)
- [ ] Doctor ID in localStorage matches appointment doctorId
- [ ] Browser console shows no errors
- [ ] Network tab shows request to appointments endpoint
- [ ] Response includes appointments array

---

## 🚨 If Still Not Working

Please provide:

1. **Backend logs** from creating appointment and payment:
   ```bash
   # Copy the logs from terminal after booking
   ```

2. **Database screenshot** from Prisma Studio:
   - Appointment table (with status column visible)
   - Payment table (with status column visible)

3. **Browser console logs**:
   - From /doctor/patients page
   - Run the Quick Test Script above

4. **Network response**:
   - From DevTools > Network > appointments request
   - Copy the response JSON

---

## 💡 Most Likely Causes

Based on common issues:

1. **Backend not restarted after fix** (70% of cases)
   - Solution: Kill and restart backend completely

2. **Old appointments in database still CONFIRMED** (20% of cases)
   - Solution: Create fresh test appointment

3. **Doctor ID mismatch** (5% of cases)
   - Solution: Verify logged-in doctor's ID matches appointment

4. **Token expired or invalid** (5% of cases)
   - Solution: Logout and login again

---

**Next Steps:**
1. Go through Step 1-5 above
2. Complete the debugging checklist
3. If still not working, share the requested information (logs, database, console)

Let's find the issue! 🔍
