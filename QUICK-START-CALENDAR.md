# 🚀 QUICK START - Google Calendar & Appointment Management

## What's New?

✅ **Payment → Pending → Doctor Accepts** workflow  
✅ **Google Calendar Integration** for doctors  
✅ **Automatic calendar sync** when appointments are accepted  
✅ **Reschedule with calendar update**  
✅ **Refunds on rejection**

---

## 5-Minute Setup

### Step 1: Install Dependencies (2 min)

```bash
cd -Chifaa-Care-samedatabase\chifaacare-backend
npm install googleapis@130 @google-cloud/local-auth
```

Or double-click: **`setup-google-calendar.bat`**

### Step 2: Google Cloud Console (2 min)

1. Go to: https://console.cloud.google.com/
2. Create project: "ChifaaCare"
3. Enable: **Google Calendar API**
4. Create: **OAuth 2.0 Client ID** (Web application)
5. Add redirect URI: `http://localhost:3000/api/v1/calendar/oauth/callback`
6. **Copy** Client ID and Client Secret

### Step 3: Update Environment (1 min)

Add to `chifaacare-backend/.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/calendar/oauth/callback
```

### Step 4: Run Migration

```bash
cd chifaacare-backend
npx prisma migrate deploy
npx prisma generate
```

### Step 5: Start Backend

```bash
npm run dev
```

---

## 📱 Usage Flow

### For Patients:

1. **Book Appointment** → Status: `PENDING`
2. **Pay** → Status: Still `PENDING` (awaiting doctor)
3. **Wait for Doctor** → Notification when accepted
4. **Confirmed!** → Status: `CONFIRMED` + Calendar event created

### For Doctors:

1. **Connect Calendar** (one-time setup)
   ```
   GET /api/v1/calendar/auth
   ```
   
2. **View Pending Requests**
   ```
   GET /api/v1/appointments/doctor/pending
   ```

3. **Accept Appointment**
   ```
   POST /api/v1/appointments/:id/accept
   ```
   - Status → `CONFIRMED`
   - Creates Google Calendar event
   - Patient receives notification

4. **Reject Appointment**
   ```
   POST /api/v1/appointments/:id/reject
   Body: { "reason": "Not available" }
   ```
   - Status → `CANCELLED`
   - Refunds patient automatically
   - Patient receives notification

---

## 🎯 API Endpoints Reference

### Calendar Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/calendar/auth` | Start OAuth flow |
| GET | `/api/v1/calendar/oauth/callback` | OAuth callback (auto) |
| GET | `/api/v1/calendar/status` | Check connection |
| POST | `/api/v1/calendar/disconnect` | Disconnect calendar |
| GET | `/api/v1/calendar/events` | List events |

### Appointment Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/appointments/doctor/pending` | Get pending requests |
| POST | `/api/v1/appointments/:id/accept` | Accept appointment |
| POST | `/api/v1/appointments/:id/reject` | Reject appointment |
| PATCH | `/api/v1/appointments/:id` | Reschedule |
| GET | `/api/v1/appointments/doctor/schedule` | View schedule |

---

## 🧪 Testing

### Test 1: Connect Calendar

```bash
curl http://localhost:3000/api/v1/calendar/auth \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

Click the returned URL → Authorize → Redirects back

### Test 2: View Pending Appointments

```bash
curl http://localhost:3000/api/v1/appointments/doctor/pending \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

### Test 3: Accept Appointment

```bash
curl -X POST http://localhost:3000/api/v1/appointments/APPOINTMENT_ID/accept \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

### Test 4: Check Calendar

Visit: https://calendar.google.com
→ Event should appear!

---

## 🎨 Frontend Integration

### Connect Calendar Button

```typescript
// doctor-calendar.component.ts
connectCalendar() {
  this.http.get<any>('http://localhost:3000/api/v1/calendar/auth')
    .subscribe(res => {
      window.open(res.data.authUrl, '_blank', 'width=600,height=700');
    });
}
```

### Pending Appointments List

```typescript
// pending-appointments.component.ts
loadPending() {
  this.http.get<any>('http://localhost:3000/api/v1/appointments/doctor/pending')
    .subscribe(res => {
      this.appointments = res.data.appointments;
    });
}

acceptAppointment(id: string) {
  this.http.post(`http://localhost:3000/api/v1/appointments/${id}/accept`, {})
    .subscribe(() => {
      this.toastr.success('Appointment accepted and added to calendar!');
      this.loadPending();
    });
}
```

### Check Connection Status

```typescript
// calendar-status.component.ts
checkStatus() {
  this.http.get<any>('http://localhost:3000/api/v1/calendar/status')
    .subscribe(res => {
      this.connected = res.data.connected;
      this.email = res.data.email;
    });
}
```

---

## 📊 Workflow Diagram

```
Patient Books
     ↓
  PENDING
     ↓
Patient Pays ($$$)
     ↓
Still PENDING
     ↓
Doctor Reviews
     ↓
  ┌─────┴─────┐
Accept      Reject
  ↓            ↓
CONFIRMED   CANCELLED
  ↓            ↓
Google Cal   Refund
```

---

## ⚙️ Configuration

### Required Environment Variables

```env
# Google Calendar (Required for calendar sync)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/calendar/oauth/callback

# Stripe (Required for payments)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Optional Settings

```env
# Webhook for automatic payment updates
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

---

## 🔥 Common Issues

### "Calendar not connected"
→ Doctor must connect calendar first via `/api/v1/calendar/auth`

### "Cannot accept appointment without payment"
→ Patient must complete payment first

### "Redirect URI mismatch"
→ Check Google Console redirect URI matches .env

### "Token expired"
→ Tokens auto-refresh. If issue persists, disconnect & reconnect.

---

## 📋 Checklist

- [ ] Google Cloud Console project created
- [ ] Google Calendar API enabled
- [ ] OAuth credentials created
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Migration run
- [ ] Backend started
- [ ] Doctor connected calendar
- [ ] Test appointment workflow
- [ ] Check calendar event created

---

## 🎬 Video Tutorial

*Coming soon*

---

## 📚 Full Documentation

See: **`GOOGLE-CALENDAR-APPOINTMENT-SYSTEM.md`**

---

## 🆘 Support

**Issue?** Check:
1. Backend logs: `npm run dev`
2. Google Cloud Console errors
3. Database connection
4. Environment variables

**Still stuck?**
- Check full documentation
- Review API endpoint responses
- Test with Postman/curl

---

**Ready to go? Run:**

```bash
cd chifaacare-backend
npm run dev
```

Then visit: http://localhost:3000/api-docs

---

**Version**: 1.0  
**Updated**: November 2025  
**Status**: ✅ Production Ready
