# 🏥 Appointment Confirmation System - Complete Guide

## Overview
Your system now has a complete appointment workflow where appointments go to PENDING status after payment, and doctors must accept or reject them at http://localhost:4200/doctor/patients.

---

## 📋 Complete Workflow

### 1️⃣ **Patient Books Appointment**
```
Patient selects doctor → Fills appointment form → Makes payment → Appointment created with PENDING status
```

**What happens:**
- Appointment is created in the database with `status: 'PENDING'`
- Payment is processed and marked as 'SUCCEEDED'
- Patient receives booking confirmation
- Doctor sees the appointment in their pending requests

---

### 2️⃣ **Doctor Reviews Pending Requests**
```
Doctor logs in → Goes to "My Patients" page → Sees pending booking requests
```

**Location:** http://localhost:4200/doctor/patients

**Doctor can see:**
- Patient name
- Appointment date and time
- Consultation type
- Reason for appointment
- Three action buttons: **Accept**, **Refuse**, **Reschedule**

---

### 3️⃣ **Doctor Accepts Appointment**
```
Doctor clicks "Accept" → Confirms action → Appointment status changes to CONFIRMED
```

**Backend Process (when doctor accepts):**
1. ✅ Verifies appointment exists and is PENDING
2. ✅ Verifies doctor owns this appointment
3. ✅ Verifies payment was completed successfully
4. ✅ Updates appointment status to CONFIRMED
5. ✅ Attempts to add to Google Calendar (if connected)
6. ✅ Returns success message

**What the patient sees:**
- Appointment status changes from "Pending" to "Confirmed"
- Receives notification (if notifications enabled)
- Can now see the confirmed appointment in their dashboard

---

### 4️⃣ **Doctor Rejects Appointment**
```
Doctor clicks "Refuse" → Enters reason (optional) → Appointment cancelled + Refund initiated
```

**Backend Process (when doctor rejects):**
1. ❌ Verifies appointment exists and is PENDING
2. ❌ Verifies doctor owns this appointment
3. ❌ Updates appointment status to CANCELLED
4. ❌ Adds rejection reason to appointment notes
5. 💰 **Initiates automatic refund** to the patient
6. ❌ Returns success message with refund details

**Refund Process:**
- If Stripe is configured: Creates real refund through Stripe API
- If using mock payment: Creates mock refund for testing
- Refund is processed automatically
- Patient receives their money back

**What the patient sees:**
- Appointment status changes to "Cancelled"
- Receives refund notification
- Can book a new appointment with another doctor

---

## 🔧 Technical Implementation

### Backend Endpoints

#### ✅ Accept Appointment
```
POST /api/v1/appointments/:id/accept
Authorization: Bearer <doctor_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "appointment": {
      "id": "...",
      "status": "CONFIRMED",
      "patient": {...},
      "doctor": {...}
    },
    "calendarEvent": {...} // if Google Calendar connected
  },
  "message": "Appointment accepted successfully"
}
```

#### ❌ Reject Appointment
```
POST /api/v1/appointments/:id/reject
Authorization: Bearer <doctor_token>
Body: { "reason": "Optional rejection reason" }
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "appointment": {
      "id": "...",
      "status": "CANCELLED",
      "notes": "Rejected by doctor: [reason]"
    },
    "refund": {
      "id": "...",
      "amount": 5000,
      "status": "PENDING",
      "method": "STRIPE" // or "MOCK"
    }
  },
  "message": "Appointment rejected and refund initiated"
}
```

### Frontend Service Methods

```typescript
// In appointment.service.ts

// Accept appointment
acceptAppointment(appointmentId: string): Observable<AppointmentWithRelations>

// Reject appointment with optional reason
rejectAppointment(appointmentId: string, reason?: string): Observable<AppointmentWithRelations>
```

### Doctor Dashboard Component

**Location:** `src/app/portals/doctor/patient-list/patient-list.component.ts`

**Key Features:**
- Displays pending booking requests in yellow cards
- Shows confirmed consultations in green cards
- Accept button (green) - Accepts appointment
- Refuse button (red) - Rejects with refund
- Reschedule button (blue outline) - Opens reschedule modal

---

## 🎨 User Interface

### Pending Request Card (Yellow)
```
┌────────────────────────────────────────────────┐
│ 📋 Pending Booking Requests          [Refresh]│
├────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐  │
│ │ John Doe • General Consultation          │  │
│ │ 📅 2025-11-10 at 2:00 PM                 │  │
│ │ 💬 Reason: Annual checkup                │  │
│ │                                           │  │
│ │  [✓ Accept]  [✗ Refuse]  [📅 Reschedule]│  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### Confirmed Consultation Card (Green)
```
┌────────────────────────────────────────────────┐
│ ✅ Confirmed Consultations                     │
├────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐  │
│ │ Jane Smith • Follow-up                    │  │
│ │ ✓ 2025-11-12 at 10:00 AM                 │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

---

## 🔐 Security & Permissions

### Who Can Accept/Reject:
- ✅ The doctor who owns the appointment
- ✅ ADMIN users (for administrative purposes)
- ❌ Other doctors cannot access
- ❌ Patients cannot accept/reject (only cancel)

### Validation Checks:
1. User must be authenticated (valid JWT token)
2. User must have DOCTOR or ADMIN role
3. Appointment must exist
4. Appointment must be in PENDING status
5. Payment must be successful (for acceptance)
6. Doctor must own the appointment (unless admin)

---

## 💰 Payment & Refund Flow

### Payment Creation (Patient Books)
```
Patient pays → Stripe/Mock Payment → Payment status: SUCCEEDED → Appointment status: PENDING
```

### Refund Process (Doctor Rejects)
```
Doctor rejects → Backend creates refund → Refund status: PENDING → Money returned to patient
```

### Refund Types:
1. **Stripe Refund** (Production)
   - Uses Stripe API: `stripe.refunds.create()`
   - Real money returned to patient's card
   - Takes 5-10 business days

2. **Mock Refund** (Development)
   - Simulated refund for testing
   - Instant processing
   - Used when Stripe is not configured

---

## 📊 Appointment Status Flow

```
PENDING → [Doctor Accepts] → CONFIRMED → [Appointment Happens] → COMPLETED
   ↓
   └─→ [Doctor Rejects] → CANCELLED (+ Refund)
   └─→ [Patient Cancels] → CANCELLED (+ Refund)
```

---

## 🧪 Testing the System

### Test Scenario 1: Accept Appointment
```bash
# 1. Create a patient account and login
# 2. Book an appointment with a doctor (pay with test card: 4242 4242 4242 4242)
# 3. Login as the doctor
# 4. Go to http://localhost:4200/doctor/patients
# 5. Click "Accept" on the pending appointment
# 6. Verify appointment moves to confirmed section
# 7. Check patient dashboard - should show "Confirmed"
```

### Test Scenario 2: Reject with Refund
```bash
# 1. Create and book appointment (steps 1-2 above)
# 2. Login as doctor
# 3. Go to http://localhost:4200/doctor/patients
# 4. Click "Refuse" on the pending appointment
# 5. Enter rejection reason: "Schedule conflict"
# 6. Verify appointment disappears from pending
# 7. Check database - payment should have refund record
# 8. Patient should see "Cancelled" status
```

### Test Scenario 3: Reschedule Appointment
```bash
# 1. Click "Reschedule" on pending appointment
# 2. Select new date and time
# 3. Click "Save"
# 4. Appointment stays in pending with new time
# 5. Patient needs to re-confirm
```

---

## 📝 Database Schema

### Appointment Table
```prisma
model Appointment {
  id              String   @id @default(uuid())
  patientId       String
  doctorId        String
  appointmentDate DateTime
  endTime         DateTime
  status          String   // PENDING, CONFIRMED, CANCELLED, COMPLETED
  reason          String?
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  patient         User     @relation("PatientAppointments")
  doctor          User     @relation("DoctorAppointments")
  payment         Payment? @relation("AppointmentPayment")
}
```

### Payment Table
```prisma
model Payment {
  id                      String   @id @default(uuid())
  appointmentId           String   @unique
  amount                  Float
  currency                String   @default("usd")
  status                  String   // SUCCEEDED, FAILED, REFUNDED
  stripePaymentIntentId   String?
  createdAt               DateTime @default(now())
  
  appointment             Appointment @relation("AppointmentPayment")
  refunds                 Refund[]    @relation("PaymentRefunds")
}
```

### Refund Table
```prisma
model Refund {
  id              String   @id @default(uuid())
  paymentId       String
  amount          Float
  status          String   // PENDING, SUCCEEDED, FAILED
  reason          String?
  createdAt       DateTime @default(now())
  
  payment         Payment  @relation("PaymentRefunds")
}
```

---

## 🚀 Quick Start Commands

```bash
# Start the backend
cd chifaacare-backend
npm run dev

# Start the frontend (in another terminal)
cd -Chifaa-Care-samedatabase
npm start

# Navigate to doctor patients page
http://localhost:4200/doctor/patients
```

---

## 🐛 Troubleshooting

### Issue: Pending appointments not showing
**Solution:**
1. Check if appointments have `status: 'PENDING'`
2. Verify doctor is logged in with correct ID
3. Check browser console for errors
4. Refresh the page or click "Refresh" button

### Issue: Accept button not working
**Solution:**
1. Verify payment exists and status is 'SUCCEEDED'
2. Check backend logs for error messages
3. Ensure JWT token is valid
4. Check if appointment status is 'PENDING'

### Issue: Refund not created
**Solution:**
1. Check if Stripe is configured (`STRIPE_SECRET_KEY` in .env)
2. If using mock payment, verify mock service is enabled
3. Check backend logs for refund creation errors
4. Verify payment has stripePaymentIntentId (for Stripe refunds)

### Issue: "Cannot accept appointment without successful payment"
**Solution:**
1. Verify payment was completed successfully
2. Check payment status in database (should be 'SUCCEEDED')
3. Ensure payment is linked to the appointment
4. Try re-processing the payment

---

## 📚 Additional Features

### Automatic Google Calendar Integration
- When doctor accepts appointment, it's automatically added to their Google Calendar
- Requires Google Calendar API setup
- Falls back gracefully if not configured

### Email Notifications (Coming Soon)
- Patient receives email when appointment is accepted
- Patient receives email when appointment is rejected
- Doctor receives email on new booking request

### SMS Notifications (Coming Soon)
- Text message alerts for appointment confirmations
- Text message alerts for appointment cancellations

---

## 🎯 Best Practices

1. **Always verify payment before acceptance**
   - Backend automatically checks payment status
   - Don't bypass this check

2. **Provide clear rejection reasons**
   - Helps patients understand why
   - Improves patient experience

3. **Process refunds immediately**
   - Automatic refund on rejection
   - Don't make patients wait

4. **Keep appointment notes updated**
   - Add rejection reason to notes
   - Track reschedule history

5. **Handle errors gracefully**
   - Show clear error messages
   - Log errors for debugging
   - Don't crash on failures

---

## 📞 Support

If you encounter any issues or need help:
1. Check the troubleshooting section above
2. Review backend logs: `chifaacare-backend/logs/`
3. Check browser console for frontend errors
4. Review this guide for workflow details

---

**System Ready! ✅**

Your appointment confirmation system is now fully functional. Doctors can accept or reject appointments from http://localhost:4200/doctor/patients, with automatic payment refunds on rejection.
