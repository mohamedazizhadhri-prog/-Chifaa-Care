# Appointment Display Issue - Debug Guide

## Problem
When a patient books an appointment and makes a payment, the appointment doesn't appear in:
1. Doctor's pending appointments list (`/doctor/patients`)
2. Doctor's calendar view

## Changes Made

### 1. Frontend - Patient List Component
**File**: `src/app/portals/doctor/patient-list/patient-list.component.ts`

**Changes**:
- Added comprehensive logging to `loadPendingBookings()` method
- Fixed role check to handle both 'doctor' and 'DOCTOR' (case-insensitive)
- Added detailed error logging with error details

### 2. Frontend - Calendar Component
**File**: `src/app/portals/doctor/calendar/doctor-calendar.component.ts`

**Changes**:
- Added comprehensive logging to `loadAppointments()` method
- Fixed role check to handle both 'doctor' and 'DOCTOR' (case-insensitive)
- Added detailed console logs for appointment loading

### 3. Backend - Appointment Controller
**File**: `chifaacare-backend/src/controllers/appointment.controller.ts`

**Changes**:
- Added logging to `getAppointments()` to track query params and results
- Added logging to `createAppointment()` to track appointment creation
- Logs show: query params, user info, where clause, found appointments, and created appointment details

## How to Debug

### Step 1: Build the Backend
```bash
cd chifaacare-backend
npm run build
```

### Step 2: Start the Backend in Dev Mode
```bash
npm run dev
```

### Step 3: Test the Flow

1. **Login as a Patient**
   - Go to `http://localhost:4200`
   - Login with patient credentials

2. **Book an Appointment**
   - Navigate to Book Consultation
   - Select a doctor
   - Choose a date/time
   - Fill in reason
   - Complete payment (mock payment will work)

3. **Check Backend Logs**
   Look for these log messages in the backend console:
   ```
   [createAppointment] incoming body:
   [createAppointment] Appointment created successfully:
   [createAppointment] ID: <appointment-id>
   [createAppointment] Status: PENDING
   [createAppointment] Doctor ID: <doctor-id>
   [createAppointment] Patient ID: <patient-id>
   ```

4. **Login as the Doctor**
   - Logout from patient account
   - Login with doctor credentials (same doctor you booked with)

5. **Check Patient List**
   - Navigate to `/doctor/patients`
   - Click "Refresh" button if needed
   - Check browser console (F12) for logs:
   ```
   Loading pending appointments for doctor: <doctor-id>
   Received pending appointments: [...]
   Number of pending appointments: X
   Final pendingBookings: [...]
   ```

6. **Check Calendar**
   - Navigate to `/doctor/calendar`
   - Check browser console for logs:
   ```
   [Calendar] Loading appointments for doctor: <doctor-id>
   [Calendar] Received appointments: [...]
   [Calendar] Number of appointments: X
   ```

7. **Check Backend Logs for getAppointments**
   ```
   [getAppointments] Query params: { status: 'PENDING', doctorId: '<doctor-id>' }
   [getAppointments] User: { userId: '<doctor-id>', userRole: 'DOCTOR' }
   [getAppointments] Final where clause: {...}
   [getAppointments] Found appointments: X
   [getAppointments] Appointments: [...]
   ```

## Common Issues and Solutions

### Issue 1: No appointments found
**Symptoms**: Backend logs show "Found appointments: 0"

**Check**:
1. Verify the appointment was created (check `[createAppointment]` logs)
2. Verify the appointment status is 'PENDING'
3. Verify the doctorId matches between patient booking and doctor login
4. Check the database directly:
   ```sql
   SELECT id, status, "doctorId", "patientId", "appointmentDate" 
   FROM "Appointment" 
   WHERE status = 'PENDING';
   ```

### Issue 2: Role mismatch
**Symptoms**: "User is not a doctor" error in frontend console

**Check**:
1. Verify you're logged in as the correct doctor
2. Check the user role in localStorage or session
3. Backend should log the user role in `[getAppointments]`

### Issue 3: Payment not completed
**Symptoms**: Appointment created but payment failed

**Check**:
1. Check Payment table in database
2. Verify payment status is 'SUCCEEDED'
3. Check `[MockPayment]` logs in backend

### Issue 4: Frontend not making request
**Symptoms**: No backend logs for `[getAppointments]`

**Check**:
1. Open browser Network tab (F12 > Network)
2. Filter for "appointments"
3. Check if request is being made
4. Check for any 401/403 errors (authentication issues)

## Database Quick Checks

### Check Appointments
```sql
SELECT 
  a.id, 
  a.status, 
  a."appointmentDate",
  p."firstName" || ' ' || p."lastName" as patient_name,
  d."firstName" || ' ' || d."lastName" as doctor_name
FROM "Appointment" a
JOIN "User" p ON a."patientId" = p.id
JOIN "User" d ON a."doctorId" = d.id
WHERE a.status = 'PENDING'
ORDER BY a."appointmentDate" DESC;
```

### Check Payments
```sql
SELECT 
  pay.id,
  pay.status,
  pay.amount,
  a."appointmentDate",
  u."firstName" || ' ' || u."lastName" as patient_name
FROM "Payment" pay
JOIN "Appointment" a ON pay."appointmentId" = a.id
JOIN "User" u ON pay."patientId" = u.id
ORDER BY pay."createdAt" DESC
LIMIT 10;
```

## Quick Fix Checklist

- [ ] Backend is running (`npm run dev`)
- [ ] Frontend is running (`ng serve`)
- [ ] Patient can see available doctors
- [ ] Patient can book appointment (check backend logs)
- [ ] Payment completes successfully (check backend logs)
- [ ] Appointment is created with status 'PENDING' (check backend logs)
- [ ] Doctor is logged in with correct credentials
- [ ] Doctor navigates to `/doctor/patients`
- [ ] Frontend makes request to backend (check Network tab)
- [ ] Backend returns appointments (check backend logs)
- [ ] Frontend displays appointments (check console logs)

## Next Steps

If the appointment still doesn't show:

1. **Check the Network tab** - Is the request being made?
2. **Check backend response** - What is the API returning?
3. **Check frontend mapping** - Is the data being transformed correctly?
4. **Check date filtering** - Are dates in the correct format?
5. **Check role/auth** - Is the doctor's token valid?

## Contact Points

If you're still stuck, provide:
1. Backend console logs (full output during booking and viewing)
2. Frontend console logs (browser console)
3. Network tab screenshot showing the appointments request/response
4. Database query results from the quick checks above
