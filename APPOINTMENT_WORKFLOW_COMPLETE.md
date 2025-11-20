# ✅ Appointment Workflow & Google Calendar Integration - COMPLETE

## Current System Status

**GOOD NEWS:** All the features you requested are **ALREADY IMPLEMENTED** in your backend! 🎉

### ✅ What's Already Built

1. **Payment-to-Pending Workflow** ✅
2. **Doctor Pending Appointments View** ✅
3. **Doctor Accept/Reject Functionality** ✅
4. **Google Calendar Integration** ✅
5. **Automatic Calendar Syncing** ✅
6. **Appointment Rescheduling** ✅

---

## 📋 Complete Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    BOOKING WORKFLOW                         │
└─────────────────────────────────────────────────────────────┘

1️⃣ PATIENT BOOKS APPOINTMENT
   └─> POST /api/v1/appointments
   └─> Status: PENDING (awaiting payment)

2️⃣ PATIENT PAYS
   └─> POST /api/v1/payment/create-intent
   └─> Payment succeeds
   └─> Status: STILL PENDING (awaiting doctor approval) ⭐

3️⃣ DOCTOR REVIEWS REQUEST
   └─> GET /api/v1/appointments/doctor/pending
   └─> Doctor sees all pending paid appointments

4️⃣ DOCTOR ACCEPTS
   └─> POST /api/v1/appointments/:id/accept
   ├─> Status: CONFIRMED ✅
   ├─> Adds event to Google Calendar 📅
   └─> Patient receives confirmation

   OR

   DOCTOR REJECTS
   └─> POST /api/v1/appointments/:id/reject
   ├─> Status: CANCELLED ❌
   ├─> Refund initiated 💰
   └─> Patient receives rejection notice
```

---

## 🔧 Backend Implementation Details

### 1. Payment Service
**File:** `chifaacare-backend/src/services/stripe.service.ts`

Key Feature:
```typescript
// After payment succeeds, appointment stays PENDING
private static async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'SUCCEEDED' }
  });
  
  // Appointment remains PENDING - doctor needs to accept! ⭐
  await prisma.appointment.update({
    where: { id: payment.appointmentId },
    data: { updatedAt: new Date() } // Status stays PENDING
  });
}
```

### 2. Appointment Controller
**File:** `chifaacare-backend/src/controllers/appointment.controller.ts`

#### Doctor Actions:

```typescript
// Get pending appointments
GET /api/v1/appointments/doctor/pending
→ Returns all appointments with status=PENDING and successful payment

// Accept appointment
POST /api/v1/appointments/:id/accept
→ Changes status to CONFIRMED
→ Creates Google Calendar event
→ Notifies patient

// Reject appointment
POST /api/v1/appointments/:id/reject
→ Changes status to CANCELLED
→ Initiates refund
→ Deletes calendar event (if exists)
```

### 3. Google Calendar Service
**File:** `chifaacare-backend/src/services/google-calendar.service.ts`

Features:
- OAuth authentication
- Create calendar events
- Update events (reschedule)
- Delete events (cancel)
- Auto-refresh tokens
- Patient email included as attendee

### 4. Calendar Routes
**File:** `chifaacare-backend/src/routes/calendar.routes.ts`

```typescript
// Connect Google Calendar
GET /api/v1/calendar/auth
→ Returns OAuth URL for doctor

// OAuth callback
GET /api/v1/calendar/oauth/callback
→ Handles Google redirect

// Check connection
GET /api/v1/calendar/status
→ Returns { connected: true/false, email: "..." }

// Disconnect
POST /api/v1/calendar/disconnect
→ Removes stored tokens
```

---

## 🎯 What You Need to Do

### Step 1: Configure Google Calendar (If Not Done)

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/

2. **Enable Google Calendar API**
   - Search for "Google Calendar API"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Create "OAuth client ID"
   - Type: Web application
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/v1/calendar/oauth/callback
     http://localhost:4200/doctor/calendar/callback
     ```

4. **Update .env File**
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/calendar/oauth/callback
   ```

### Step 2: Verify Database Schema

Check that you have the latest schema:

```bash
cd chifaacare-backend
npx prisma migrate status
```

Required fields in User model:
```prisma
model User {
  googleCalendarToken   String?   @unique
  googleCalendarRefresh String?
  googleCalendarExpiry  DateTime?
}
```

If missing, run migration:
```bash
npx prisma migrate dev --name add-google-calendar
```

### Step 3: Install Dependencies (If Not Installed)

```bash
cd chifaacare-backend
npm install googleapis @google-cloud/local-auth
```

---

## 🖥️ Frontend Integration Needed

### 1. Doctor Pending Appointments Component

**Create:** `src/app/portals/doctor/pending-appointments/`

```typescript
@Component({
  selector: 'app-pending-appointments',
  template: `
    <div class="pending-container">
      <h2>Pending Appointment Requests ({{appointments.length}})</h2>
      
      <div *ngFor="let apt of appointments" class="appointment-card">
        <div class="patient-info">
          <h3>{{apt.patient.firstName}} {{apt.patient.lastName}}</h3>
          <p>{{apt.patient.email}}</p>
        </div>
        
        <div class="details">
          <p><strong>Date:</strong> {{apt.appointmentDate | date:'medium'}}</p>
          <p><strong>Reason:</strong> {{apt.reason}}</p>
          <p><strong>Payment:</strong> ${{apt.payment?.amount / 100}}</p>
        </div>
        
        <div class="actions">
          <button (click)="accept(apt.id)" class="btn-accept">Accept</button>
          <button (click)="reject(apt.id)" class="btn-reject">Reject</button>
        </div>
      </div>
    </div>
  `
})
export class PendingAppointmentsComponent {
  appointments: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<any>('http://localhost:3000/api/v1/appointments/doctor/pending')
      .subscribe(res => this.appointments = res.data.appointments);
  }

  accept(id: string) {
    this.http.post(`http://localhost:3000/api/v1/appointments/${id}/accept`, {})
      .subscribe(() => {
        alert('Appointment accepted and added to calendar!');
        this.load();
      });
  }

  reject(id: string) {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      this.http.post(`http://localhost:3000/api/v1/appointments/${id}/reject`, { reason })
        .subscribe(() => {
          alert('Appointment rejected and refund initiated.');
          this.load();
        });
    }
  }
}
```

### 2. Google Calendar Connection Component

**Create:** `src/app/portals/doctor/calendar-settings/`

```typescript
@Component({
  selector: 'app-calendar-settings',
  template: `
    <div class="calendar-card">
      <h2>Google Calendar Integration</h2>
      
      <div *ngIf="!connected">
        <p>Connect your Google Calendar to automatically sync appointments</p>
        <button (click)="connect()" class="btn-primary">
          <i class="icon-calendar"></i>
          Connect Google Calendar
        </button>
      </div>
      
      <div *ngIf="connected" class="connected-status">
        <div class="status-badge">
          <i class="icon-check-circle"></i>
          <span>Connected</span>
        </div>
        <p class="email">{{calendarEmail}}</p>
        <button (click)="disconnect()" class="btn-secondary">
          Disconnect
        </button>
      </div>
    </div>
  `
})
export class CalendarSettingsComponent {
  connected = false;
  calendarEmail = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    this.http.get<any>('http://localhost:3000/api/v1/calendar/status')
      .subscribe(res => {
        this.connected = res.data.connected;
        this.calendarEmail = res.data.email || '';
      });
  }

  connect() {
    this.http.get<any>('http://localhost:3000/api/v1/calendar/auth')
      .subscribe(res => {
        // Redirect to Google OAuth
        window.location.href = res.data.authUrl;
      });
  }

  disconnect() {
    if (confirm('Are you sure you want to disconnect Google Calendar?')) {
      this.http.post('http://localhost:3000/api/v1/calendar/disconnect', {})
        .subscribe(() => {
          this.connected = false;
          this.calendarEmail = '';
          alert('Google Calendar disconnected successfully');
        });
    }
  }
}
```

### 3. Calendar Callback Handler

**Create:** `src/app/portals/doctor/calendar-callback/`

```typescript
@Component({
  selector: 'app-calendar-callback',
  template: `
    <div class="callback-container">
      <div class="spinner"></div>
      <p>Connecting to Google Calendar...</p>
    </div>
  `
})
export class CalendarCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Google redirects here after OAuth
    // The backend handles the callback at /api/v1/calendar/oauth/callback
    // After success, redirect to settings page
    setTimeout(() => {
      this.router.navigate(['/doctor/settings']);
    }, 2000);
  }
}
```

### 4. Update Doctor Dashboard

Add pending appointments widget:

```typescript
<div class="dashboard-widget">
  <div class="widget-header">
    <h3>Pending Requests</h3>
    <span class="badge">{{pendingCount}}</span>
  </div>
  <div class="widget-body">
    <p>You have {{pendingCount}} appointment requests waiting for approval</p>
    <button routerLink="/doctor/pending" class="btn-link">
      Review Requests →
    </button>
  </div>
</div>
```

---

## 📱 API Endpoints Reference

### Appointment Endpoints

```typescript
// Create appointment (Patient)
POST /api/v1/appointments
Body: {
  doctorId: string,
  appointmentDate: ISO8601,
  endTime: ISO8601,
  reason: string,
  notes?: string
}
Response: { status: 'success', data: { appointment } }

// Get doctor's pending requests
GET /api/v1/appointments/doctor/pending
Headers: Authorization: Bearer <doctor_token>
Response: {
  status: 'success',
  results: number,
  data: {
    appointments: [{
      id, patient, appointmentDate, endTime,
      reason, status, payment
    }]
  }
}

// Accept appointment
POST /api/v1/appointments/:id/accept
Headers: Authorization: Bearer <doctor_token>
Response: {
  status: 'success',
  data: {
    appointment: {...},
    calendarEvent: { id, link }
  }
}

// Reject appointment
POST /api/v1/appointments/:id/reject
Headers: Authorization: Bearer <doctor_token>
Body: { reason: string }
Response: {
  status: 'success',
  data: {
    appointment: {...},
    refund: {...}
  }
}

// Get upcoming confirmed appointments
GET /api/v1/appointments/doctor/upcoming
Headers: Authorization: Bearer <doctor_token>
Response: {
  status: 'success',
  results: number,
  data: { appointments: [...] }
}

// Reschedule appointment
PATCH /api/v1/appointments/:id
Headers: Authorization: Bearer <token>
Body: {
  appointmentDate: ISO8601,
  endTime: ISO8601,
  reason?: string
}
Response: { status: 'success', data: { appointment } }
```

### Calendar Endpoints

```typescript
// Start OAuth flow
GET /api/v1/calendar/auth
Headers: Authorization: Bearer <doctor_token>
Response: { status: 'success', data: { authUrl: string } }

// Check connection status
GET /api/v1/calendar/status
Headers: Authorization: Bearer <doctor_token>
Response: {
  status: 'success',
  data: {
    connected: boolean,
    email?: string
  }
}

// Disconnect calendar
POST /api/v1/calendar/disconnect
Headers: Authorization: Bearer <doctor_token>
Response: { status: 'success' }

// List upcoming calendar events
GET /api/v1/calendar/events
Headers: Authorization: Bearer <doctor_token>
Response: { status: 'success', data: { events: [...] } }

// Manually sync appointment
POST /api/v1/calendar/sync/:appointmentId
Headers: Authorization: Bearer <doctor_token>
Response: { status: 'success', data: { eventId, eventLink } }
```

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] Patient can create appointment
- [ ] Appointment starts with status PENDING
- [ ] Patient can pay for appointment
- [ ] After payment, status remains PENDING
- [ ] Doctor can view pending appointments
- [ ] Doctor can accept appointment
  - [ ] Status changes to CONFIRMED
  - [ ] Calendar event created (if connected)
- [ ] Doctor can reject appointment
  - [ ] Status changes to CANCELLED
  - [ ] Refund initiated
- [ ] Appointment can be rescheduled
  - [ ] Calendar event updated
- [ ] Appointment can be cancelled
  - [ ] Calendar event deleted

### Frontend Tests

- [ ] Pending appointments page displays correctly
- [ ] Accept button works
- [ ] Reject button works
- [ ] Calendar connect button redirects to Google
- [ ] OAuth callback returns to app
- [ ] Connection status displays correctly
- [ ] Disconnect button works
- [ ] Dashboard shows pending count

---

## 🔍 Debugging

### Check Backend Logs

```bash
cd chifaacare-backend
npm run dev
```

Look for these log messages:
```
[createAppointment] incoming body: {...}
[createPaymentIntent] Request: {...}
Payment succeeded for appointment <id> - keeping status as PENDING
```

### Check Database

```sql
-- View all appointments with payment status
SELECT 
  a.id,
  a.status as appointment_status,
  a.appointmentDate,
  p.status as payment_status,
  p.amount
FROM Appointment a
LEFT JOIN Payment p ON p.appointmentId = a.id
WHERE a.doctorId = '<doctor_id>'
ORDER BY a.appointmentDate DESC;
```

### Common Issues

1. **Appointments auto-confirming after payment**
   - ✅ Fixed in `stripe.service.ts` - handlePaymentSucceeded keeps PENDING

2. **Calendar not connecting**
   - Check Google Cloud Console OAuth settings
   - Verify redirect URI matches exactly
   - Check environment variables

3. **Refund not working**
   - Ensure Stripe is configured (not mock mode)
   - Check payment.status = 'SUCCEEDED' before refund

---

## 🚀 Quick Start Guide

### For Developers

1. **Ensure backend is running**
   ```bash
   cd chifaacare-backend
   npm install
   npm run dev
   ```

2. **Configure Google Calendar** (follow Step 1 above)

3. **Create frontend components** (follow Frontend Integration section)

4. **Test the workflow**:
   - Patient books appointment
   - Patient pays
   - Doctor sees in pending list
   - Doctor accepts
   - Check Google Calendar for event

### For Doctors

1. **Connect Google Calendar**
   - Go to Settings → Calendar Integration
   - Click "Connect Google Calendar"
   - Authorize access

2. **Review Pending Requests**
   - Go to "Pending Appointments"
   - Review patient details and payment
   - Accept or reject

3. **View Schedule**
   - Open Google Calendar
   - See all confirmed appointments
   - Get automatic reminders

---

## 📚 Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Stripe Refunds Documentation](https://stripe.com/docs/refunds)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

## ✅ Summary

**Everything is already implemented in your backend!** You just need to:

1. Configure Google Calendar OAuth (5 minutes)
2. Add the frontend components shown above (30 minutes)
3. Test the complete workflow (10 minutes)

The system will then work as follows:
- Patient books → Status: PENDING
- Patient pays → Status: STILL PENDING (awaiting doctor approval) ⭐
- Doctor accepts → Status: CONFIRMED + Calendar event created 📅
- Doctor rejects → Status: CANCELLED + Refund initiated 💰

---

**Created**: November 5, 2025  
**Status**: ✅ Ready to Use  
**Next Steps**: Configure Google OAuth and create frontend components
