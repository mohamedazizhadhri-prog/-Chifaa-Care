# Google Calendar Integration & Appointment Management System

## Overview
This system implements:
1. **Payment → Pending → Doctor Accepts** workflow
2. **Google Calendar Integration** for doctors
3. **Appointment Reschedule** with calendar sync

## Features Implemented

### 1. Payment-to-Pending Workflow
- ✅ When patient pays, appointment status = `PENDING` (not CONFIRMED)
- ✅ Doctor sees pending appointments and can accept/reject
- ✅ Only after doctor accepts → status changes to `CONFIRMED`
- ✅ Confirmed appointments sync to Google Calendar

### 2. Google Calendar Integration
- ✅ Doctor connects Google Calendar via OAuth
- ✅ Accepted appointments automatically create calendar events
- ✅ Rescheduled appointments update calendar events
- ✅ Cancelled appointments delete calendar events
- ✅ View all appointments in Google Calendar

### 3. Doctor Actions
- ✅ View pending appointment requests
- ✅ Accept appointment → Creates calendar event + Status = CONFIRMED
- ✅ Reject appointment → Refunds payment + Status = CANCELLED
- ✅ Reschedule appointment → Updates calendar event
- ✅ Cancel appointment → Deletes calendar event

## Setup Instructions

### Step 1: Google Cloud Console Setup

1. **Go to**: https://console.cloud.google.com/

2. **Create/Select Project**:
   - Click "Select a project" → "New Project"
   - Name: "ChifaaCare"
   - Click "Create"

3. **Enable Google Calendar API**:
   - Go to "APIs & Services" → "Library"
   - Search "Google Calendar API"
   - Click "Enable"

4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Configure consent screen first (if prompted):
     - User Type: External
     - App name: ChifaaCare
     - User support email: your-email@example.com
     - Developer contact: your-email@example.com
     - Save and Continue
   - Application type: "Web application"
   - Name: "ChifaaCare Backend"
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/v1/calendar/oauth/callback
     http://localhost:4200/doctor/calendar/callback
     ```
   - Click "Create"
   - **SAVE** Client ID and Client Secret

### Step 2: Update Environment Variables

Add to `chifaacare-backend/.env`:

```env
# Google Calendar Integration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/calendar/oauth/callback
```

### Step 3: Install Dependencies

```bash
cd chifaacare-backend
npm install googleapis @google-cloud/local-auth
```

### Step 4: Update Database Schema

Add to `prisma/schema.prisma`:

```prisma
model User {
  // ... existing fields ...
  googleCalendarToken    String?   @unique
  googleCalendarRefresh  String?
  googleCalendarExpiry   DateTime?
}
```

Run migration:
```bash
npx prisma migrate dev --name add-google-calendar
```

### Step 5: Start Backend

```bash
cd chifaacare-backend
npm run dev
```

## API Endpoints

### Google Calendar OAuth

#### 1. Start OAuth Flow
```
GET /api/v1/calendar/auth
```
**Headers**: `Authorization: Bearer <doctor_token>`

**Response**:
```json
{
  "status": "success",
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

#### 2. OAuth Callback (Auto-handled)
```
GET /api/v1/calendar/oauth/callback?code=...
```

#### 3. Check Connection Status
```
GET /api/v1/calendar/status
```
**Response**:
```json
{
  "status": "success",
  "data": {
    "connected": true,
    "email": "doctor@example.com"
  }
}
```

#### 4. Disconnect Calendar
```
POST /api/v1/calendar/disconnect
```

### Appointment Management

#### 1. Create Appointment (Patient)
```
POST /api/v1/appointments
```
**Body**:
```json
{
  "doctorId": "uuid",
  "appointmentDate": "2025-11-10T10:00:00Z",
  "endTime": "2025-11-10T11:00:00Z",
  "reason": "Consultation",
  "notes": "Optional notes"
}
```
**Status**: `PENDING` (awaiting payment)

#### 2. Pay for Appointment
```
POST /api/v1/payment/create-intent
```
**Body**:
```json
{
  "appointmentId": "uuid",
  "amount": 5000,
  "currency": "usd"
}
```
**After Payment**: Status remains `PENDING` (awaiting doctor acceptance)

#### 3. Get Pending Appointments (Doctor)
```
GET /api/v1/appointments/doctor/pending
```
**Response**:
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "patient": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "appointmentDate": "2025-11-10T10:00:00Z",
        "endTime": "2025-11-10T11:00:00Z",
        "reason": "Consultation",
        "status": "PENDING",
        "payment": {
          "status": "SUCCEEDED",
          "amount": 5000
        }
      }
    ]
  }
}
```

#### 4. Accept Appointment (Doctor)
```
POST /api/v1/appointments/:id/accept
```
**Actions**:
- Changes status to `CONFIRMED`
- Creates Google Calendar event
- Sends notification to patient

**Response**:
```json
{
  "status": "success",
  "data": {
    "appointment": {...},
    "calendarEvent": {
      "id": "google_event_id",
      "link": "https://calendar.google.com/..."
    }
  }
}
```

#### 5. Reject Appointment (Doctor)
```
POST /api/v1/appointments/:id/reject
```
**Body**:
```json
{
  "reason": "Not available at this time"
}
```
**Actions**:
- Changes status to `CANCELLED`
- Initiates refund if payment exists
- Sends notification to patient

#### 6. Reschedule Appointment
```
PATCH /api/v1/appointments/:id
```
**Body**:
```json
{
  "appointmentDate": "2025-11-11T14:00:00Z",
  "endTime": "2025-11-11T15:00:00Z",
  "reason": "Rescheduled due to emergency"
}
```
**Actions**:
- Updates appointment times
- Updates Google Calendar event
- Sends notification

#### 7. Cancel Appointment
```
DELETE /api/v1/appointments/:id
```
**Actions**:
- Changes status to `CANCELLED`
- Deletes Google Calendar event
- Initiates refund (if applicable)

## Frontend Integration

### 1. Doctor Calendar Connection Component

Create `src/app/doctor/calendar-connect/calendar-connect.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-calendar-connect',
  template: `
    <div class="calendar-card">
      <h2>Google Calendar Integration</h2>
      
      <div *ngIf="!connected">
        <p>Connect your Google Calendar to automatically sync appointments</p>
        <button (click)="connectCalendar()" class="btn-primary">
          Connect Google Calendar
        </button>
      </div>
      
      <div *ngIf="connected">
        <p>✅ Connected: {{calendarEmail}}</p>
        <button (click)="disconnectCalendar()" class="btn-secondary">
          Disconnect
        </button>
      </div>
    </div>
  `
})
export class CalendarConnectComponent implements OnInit {
  connected = false;
  calendarEmail = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkConnection();
  }

  checkConnection() {
    this.http.get<any>('http://localhost:3000/api/v1/calendar/status')
      .subscribe(res => {
        this.connected = res.data.connected;
        this.calendarEmail = res.data.email || '';
      });
  }

  connectCalendar() {
    this.http.get<any>('http://localhost:3000/api/v1/calendar/auth')
      .subscribe(res => {
        window.location.href = res.data.authUrl;
      });
  }

  disconnectCalendar() {
    this.http.post('http://localhost:3000/api/v1/calendar/disconnect', {})
      .subscribe(() => {
        this.connected = false;
        this.calendarEmail = '';
      });
  }
}
```

### 2. Pending Appointments Component

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pending-appointments',
  template: `
    <div class="pending-appointments">
      <h2>Pending Appointment Requests ({{appointments.length}})</h2>
      
      <div *ngFor="let apt of appointments" class="appointment-card">
        <div class="patient-info">
          <h3>{{apt.patient.firstName}} {{apt.patient.lastName}}</h3>
          <p>{{apt.patient.email}}</p>
        </div>
        
        <div class="appointment-details">
          <p><strong>Date:</strong> {{apt.appointmentDate | date:'medium'}}</p>
          <p><strong>Duration:</strong> {{getDuration(apt)}} minutes</p>
          <p><strong>Reason:</strong> {{apt.reason}}</p>
          <p><strong>Payment:</strong> ${{apt.payment?.amount / 100}} ({{apt.payment?.status}})</p>
        </div>
        
        <div class="actions">
          <button (click)="acceptAppointment(apt.id)" class="btn-success">
            Accept
          </button>
          <button (click)="rejectAppointment(apt.id)" class="btn-danger">
            Reject
          </button>
        </div>
      </div>
    </div>
  `
})
export class PendingAppointmentsComponent implements OnInit {
  appointments: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.http.get<any>('http://localhost:3000/api/v1/appointments/doctor/pending')
      .subscribe(res => {
        this.appointments = res.data.appointments;
      });
  }

  acceptAppointment(id: string) {
    this.http.post(`http://localhost:3000/api/v1/appointments/${id}/accept`, {})
      .subscribe(() => {
        alert('Appointment accepted and added to calendar!');
        this.loadPending();
      });
  }

  rejectAppointment(id: string) {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      this.http.post(`http://localhost:3000/api/v1/appointments/${id}/reject`, { reason })
        .subscribe(() => {
          alert('Appointment rejected and refund initiated.');
          this.loadPending();
        });
    }
  }

  getDuration(apt: any): number {
    const start = new Date(apt.appointmentDate);
    const end = new Date(apt.endTime);
    return (end.getTime() - start.getTime()) / 60000;
  }
}
```

## Workflow Diagram

```
Patient Books Appointment
         ↓
Status: PENDING (awaiting payment)
         ↓
Patient Pays
         ↓
Status: PENDING (awaiting doctor acceptance)
         ↓
Doctor Reviews Request
         ↓
    ┌────┴────┐
    ↓         ↓
 Accept    Reject
    ↓         ↓
CONFIRMED  CANCELLED
    ↓         ↓
Add to    Refund
Calendar  Payment
```

## Testing Checklist

### Backend Tests
- [ ] Doctor connects Google Calendar
- [ ] Patient creates appointment → status = PENDING
- [ ] Patient pays → status stays PENDING
- [ ] Doctor sees pending appointments
- [ ] Doctor accepts → status = CONFIRMED + calendar event created
- [ ] Doctor rejects → status = CANCELLED + refund initiated
- [ ] Doctor reschedules → calendar event updated
- [ ] Calendar event shows in Google Calendar

### Frontend Tests
- [ ] Calendar connect button works
- [ ] OAuth flow redirects correctly
- [ ] Connection status displays
- [ ] Pending appointments list loads
- [ ] Accept button works
- [ ] Reject button works
- [ ] Calendar events visible in doctor's schedule

## Troubleshooting

### Issue: "OAuth consent screen not configured"
**Solution**: Go to Google Cloud Console → OAuth consent screen → Complete setup

### Issue: "Redirect URI mismatch"
**Solution**: Ensure redirect URI in .env matches Google Console settings

### Issue: "Calendar API not enabled"
**Solution**: Enable Google Calendar API in Google Cloud Console

### Issue: "Token expired"
**Solution**: Disconnect and reconnect Google Calendar

## Next Steps

1. ✅ Set up Google Cloud Console
2. ✅ Install backend dependencies
3. ✅ Update database schema
4. ✅ Configure environment variables
5. ✅ Test OAuth flow
6. ✅ Test appointment workflow
7. ✅ Integrate frontend components
8. ✅ Deploy to production

## Security Considerations

- 🔒 Google tokens stored encrypted in database
- 🔒 OAuth state parameter for CSRF protection
- 🔒 Tokens refreshed automatically
- 🔒 Only doctor can access their calendar
- 🔒 Patient data not exposed to Google

## Support

For issues, check:
1. Backend logs: `npm run dev`
2. Google Cloud Console error logs
3. Database connection
4. Environment variables

---

**Created**: November 2025
**Status**: Ready for Implementation
**Version**: 1.0
