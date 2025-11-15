# 🎯 Appointment Workflow - Visual Guide

## Current vs Requested Workflow

### ❌ OLD WORKFLOW (Auto-Confirm)
```
Patient Books → Patient Pays → CONFIRMED ✅
                                    ↓
                              Doctor has to deal with it
```

### ✅ NEW WORKFLOW (Pending → Doctor Approval)
```
Patient Books → Patient Pays → PENDING ⏳
                                    ↓
                         Doctor Reviews Request
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
              ✅ ACCEPT                        ❌ REJECT
                    ↓                               ↓
              CONFIRMED                        CANCELLED
                    ↓                               ↓
         Add to Google Calendar              Refund Payment
```

## Status Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        APPOINTMENT LIFECYCLE                      │
└──────────────────────────────────────────────────────────────────┘

PENDING          Status when patient first books
   ↓
   ├─→ Patient hasn't paid yet
   │   └─→ Status: PENDING (awaiting payment)
   │
   └─→ Patient paid successfully ✅
       └─→ Status: STILL PENDING (awaiting doctor approval) ⭐
           │
           ├─→ Doctor ACCEPTS
           │   ├─→ Status: CONFIRMED ✅
           │   ├─→ Add to Google Calendar 📅
           │   └─→ Patient notified
           │
           └─→ Doctor REJECTS
               ├─→ Status: CANCELLED ❌
               ├─→ Refund initiated 💰
               └─→ Patient notified

CONFIRMED       Appointment accepted by doctor
   ↓
   ├─→ Appointment happens
   │   └─→ Status: COMPLETED ✅
   │
   ├─→ Patient/Doctor reschedules
   │   ├─→ Update times
   │   └─→ Update Google Calendar 📅
   │
   └─→ Patient/Doctor cancels
       ├─→ Status: CANCELLED ❌
       └─→ Delete from Google Calendar 🗑️

CANCELLED       Appointment not happening
COMPLETED       Appointment finished
NO_SHOW         Patient didn't show up
```

## Google Calendar Integration

```
┌─────────────────────────────────────────────────────────────┐
│                   GOOGLE CALENDAR SYNC                      │
└─────────────────────────────────────────────────────────────┘

Doctor First Time Setup:
─────────────────────────
1. Click "Connect Google Calendar"
2. Redirected to Google OAuth
3. Grant permissions
4. Tokens stored in database
5. ✅ Connected!

When Doctor Accepts Appointment:
─────────────────────────────────
1. Doctor clicks "Accept"
2. Backend API call: POST /appointments/:id/accept
3. Status: PENDING → CONFIRMED
4. ✅ Create Google Calendar Event
   ├─→ Event title: "Consultation with [Patient Name]"
   ├─→ Date/Time: From appointment
   ├─→ Duration: appointmentDate → endTime
   ├─→ Attendees: patient email
   ├─→ Reminders: 1 day + 30 min before
   └─→ Description: Reason, notes, patient info
5. Store event ID in appointment.notes
6. Return event link to frontend

When Appointment is Rescheduled:
────────────────────────────────
1. PATCH /appointments/:id
2. Extract calendar event ID from notes
3. ✅ Update Google Calendar Event
   └─→ New date/time
4. Send update notification to attendees

When Appointment is Cancelled:
──────────────────────────────
1. DELETE /appointments/:id
2. Extract calendar event ID
3. 🗑️ Delete Google Calendar Event
4. Send cancellation to attendees
```

## Doctor Dashboard View

```
┌─────────────────────────────────────────────────────────────────┐
│                       DOCTOR DASHBOARD                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📋 Pending Requests (3) ⚠️                                     │
│  ─────────────────────────────────────────────────────────────  │
│  │ John Doe                                    🕐 Today 10:00 │ │
│  │ Reason: Regular checkup                     💰 Paid $50    │ │
│  │ [✅ Accept] [❌ Reject]                                     │ │
│  ├───────────────────────────────────────────────────────────  │
│  │ Jane Smith                                  🕐 Tomorrow    │ │
│  │ Reason: Follow-up                           💰 Paid $75    │ │
│  │ [✅ Accept] [❌ Reject]                                     │ │
│  └───────────────────────────────────────────────────────────  │
│                                                                 │
│  📅 Upcoming Consultations (5)                                  │
│  ─────────────────────────────────────────────────────────────  │
│  │ Mike Johnson - Today 2:00 PM                              │ │
│  │ Sarah Williams - Tomorrow 9:00 AM                         │ │
│  │ ...                                                       │ │
│  └───────────────────────────────────────────────────────────  │
│                                                                 │
│  🔗 Google Calendar: ✅ Connected (doctor@example.com)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Patient View

```
┌─────────────────────────────────────────────────────────────────┐
│                       PATIENT DASHBOARD                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📋 My Appointments                                             │
│                                                                 │
│  ⏳ Pending Approval                                            │
│  ─────────────────────────────────────────────────────────────  │
│  │ Dr. Smith - Nov 10, 2025 at 10:00 AM                      │ │
│  │ Status: Waiting for doctor approval                       │ │
│  │ Payment: ✅ Paid $50                                       │ │
│  └───────────────────────────────────────────────────────────  │
│                                                                 │
│  ✅ Confirmed                                                   │
│  ─────────────────────────────────────────────────────────────  │
│  │ Dr. Jones - Nov 8, 2025 at 2:00 PM                        │ │
│  │ Status: Confirmed by doctor                               │ │
│  │ [View Details] [Reschedule] [Cancel]                      │ │
│  └───────────────────────────────────────────────────────────  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Notification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         NOTIFICATIONS                           │
└─────────────────────────────────────────────────────────────────┘

When Patient Pays:
──────────────────
📧 To Patient:  "Payment successful! Waiting for doctor approval."
📧 To Doctor:   "New appointment request from John Doe"

When Doctor Accepts:
────────────────────
📧 To Patient:  "Your appointment is confirmed! 📅"
📅 Calendar:    Event added to both Google Calendars
📧 To Doctor:   "You accepted appointment with John Doe"

When Doctor Rejects:
────────────────────
📧 To Patient:  "Appointment declined. Refund initiated. 💰"
📧 To Doctor:   "You rejected appointment from John Doe"

When Rescheduled:
─────────────────
📧 To Both:     "Appointment rescheduled to [new date]"
📅 Calendar:    Event updated in Google Calendar
```

## API Flow Example

```javascript
// COMPLETE USER JOURNEY
// ─────────────────────

// 1️⃣ Patient books appointment
POST /api/v1/appointments
{
  "doctorId": "doc-123",
  "appointmentDate": "2025-11-10T10:00:00Z",
  "endTime": "2025-11-10T11:00:00Z",
  "reason": "Regular checkup"
}
→ Response: { appointment: { id: "apt-456", status: "PENDING" } }

// 2️⃣ Patient pays
POST /api/v1/payment/create-intent
{
  "appointmentId": "apt-456",
  "amount": 5000,  // $50.00 in cents
  "currency": "usd"
}
→ Response: { clientSecret: "pi_...", paymentId: "pay-789" }

// Frontend: Process payment with Stripe
// Payment succeeds → Webhook fires
→ Appointment status: STILL "PENDING" ⭐

// 3️⃣ Doctor views pending requests
GET /api/v1/appointments/doctor/pending
→ Response: {
    appointments: [{
      id: "apt-456",
      patient: { firstName: "John", lastName: "Doe" },
      appointmentDate: "2025-11-10T10:00:00Z",
      status: "PENDING",
      payment: { status: "SUCCEEDED", amount: 5000 }
    }]
  }

// 4️⃣ Doctor accepts
POST /api/v1/appointments/apt-456/accept
→ Response: {
    appointment: { id: "apt-456", status: "CONFIRMED" },
    calendarEvent: {
      id: "gcal-event-id",
      link: "https://calendar.google.com/..."
    }
  }

// ✅ Done! Appointment confirmed and in calendar!
```

## Database Schema

```
User
├─ id
├─ email
├─ firstName
├─ lastName
├─ role (PATIENT | DOCTOR | ADMIN)
├─ googleCalendarToken    ← OAuth access token
├─ googleCalendarRefresh  ← Refresh token
└─ googleCalendarExpiry   ← Token expiration

Appointment
├─ id
├─ patientId → User
├─ doctorId → User
├─ appointmentDate
├─ endTime
├─ status (PENDING | CONFIRMED | CANCELLED | COMPLETED)
├─ reason
├─ notes (stores calendar event ID)
└─ payment → Payment

Payment
├─ id
├─ appointmentId → Appointment
├─ patientId → User
├─ amount
├─ currency
├─ status (PENDING | SUCCEEDED | FAILED | REFUNDED)
├─ stripePaymentIntentId
└─ stripeClientSecret
```

## Environment Variables Needed

```env
# Google Calendar
GOOGLE_CLIENT_ID=your_client_id_from_google_cloud_console
GOOGLE_CLIENT_SECRET=your_client_secret_from_google_cloud_console
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/calendar/oauth/callback

# Stripe Payment (optional, uses mock if not set)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chifaacare
```

## Quick Reference: Important Files

```
Backend:
────────
✅ src/controllers/appointment.controller.ts   - Accept/Reject logic
✅ src/controllers/calendar.controller.ts      - Calendar OAuth
✅ src/services/google-calendar.service.ts     - Calendar operations
✅ src/services/stripe.service.ts              - Payment (keeps PENDING)
✅ src/routes/appointment.routes.ts            - Appointment endpoints
✅ src/routes/calendar.routes.ts               - Calendar endpoints
✅ prisma/schema.prisma                        - Database schema

Frontend (to create):
────────────────────
❌ src/app/portals/doctor/pending-appointments/    - Pending list
❌ src/app/portals/doctor/calendar-settings/       - Connect calendar
❌ src/app/portals/doctor/calendar-callback/       - OAuth callback
```

---

## 🎓 Key Concepts

### Why Keep PENDING After Payment?

```
❌ Auto-Confirm Problem:
   Patient pays → CONFIRMED → Doctor stuck with appointment
   - Doctor might not be available
   - Doctor might not want that patient
   - No flexibility for doctor

✅ Pending-for-Approval Solution:
   Patient pays → PENDING → Doctor reviews → Accept/Reject
   - Doctor has control
   - Can review patient history
   - Can manage schedule better
   - Better patient matching
```

### Google Calendar Benefits

```
✅ Automatic Syncing
   - No manual entry needed
   - Always up-to-date
   - Works on all devices

✅ Smart Reminders
   - 1 day before (email)
   - 30 minutes before (popup)
   - Patient also gets reminders

✅ Easy Rescheduling
   - Change time in app → Calendar updates
   - Cancel appointment → Removed from calendar
   - No double-booking
```

---

**Last Updated**: November 5, 2025  
**Status**: ✅ All Backend Features Implemented  
**Next**: Add Frontend Components
