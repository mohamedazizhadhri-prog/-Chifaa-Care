# 🎯 Appointment Confirmation - Quick Reference

## 🔄 Complete Flow in 4 Steps

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: PATIENT BOOKS                                          │
├─────────────────────────────────────────────────────────────────┤
│  Patient → Select Doctor → Fill Form → Pay → Status: PENDING   │
│  💳 Payment: SUCCEEDED ✅                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: DOCTOR REVIEWS                                         │
├─────────────────────────────────────────────────────────────────┤
│  🔗 http://localhost:4200/doctor/patients                       │
│  Doctor sees pending request in yellow card                     │
│                                                                  │
│  [✅ Accept]  [❌ Refuse]  [📅 Reschedule]                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3A: DOCTOR ACCEPTS                                        │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Status: PENDING → CONFIRMED                                 │
│  ✅ Added to Google Calendar (if connected)                     │
│  ✅ Patient notified                                            │
│  ✅ Appears in confirmed section (green)                        │
└─────────────────────────────────────────────────────────────────┘

                              OR

┌─────────────────────────────────────────────────────────────────┐
│  STEP 3B: DOCTOR REJECTS                                        │
├─────────────────────────────────────────────────────────────────┤
│  ❌ Status: PENDING → CANCELLED                                 │
│  💰 Automatic refund initiated                                  │
│  📝 Rejection reason saved                                      │
│  📧 Patient notified                                            │
│  💵 Money returned to patient                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: FINAL STATUS                                           │
├─────────────────────────────────────────────────────────────────┤
│  ✅ CONFIRMED → Patient attends appointment                     │
│  ❌ CANCELLED → Patient can book with another doctor            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Elements

### Yellow Card (Pending Request)
```
╔════════════════════════════════════════════════════════════╗
║ 📋 Pending Booking Requests                     [Refresh]  ║
╠════════════════════════════════════════════════════════════╣
║ ┌────────────────────────────────────────────────────────┐ ║
║ │ 👤 John Doe • General Consultation                     │ ║
║ │ 📅 November 10, 2025 at 2:00 PM                        │ ║
║ │ 💬 Annual health checkup                               │ ║
║ │                                                         │ ║
║ │  [✅ Accept]    [❌ Refuse]    [📅 Reschedule]        │ ║
║ └────────────────────────────────────────────────────────┘ ║
╚════════════════════════════════════════════════════════════╝
```

### Green Card (Confirmed)
```
╔════════════════════════════════════════════════════════════╗
║ ✅ Confirmed Consultations                                 ║
╠════════════════════════════════════════════════════════════╣
║ ┌────────────────────────────────────────────────────────┐ ║
║ │ 👤 Jane Smith • Follow-up                              │ ║
║ │ ✓ November 12, 2025 at 10:00 AM                        │ ║
║ └────────────────────────────────────────────────────────┘ ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🔧 API Endpoints

### Accept Appointment
```http
POST /api/v1/appointments/:id/accept
Authorization: Bearer <token>
```

### Reject Appointment
```http
POST /api/v1/appointments/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Schedule conflict"
}
```

---

## 💡 Quick Tips

### For Doctors:
1. ✅ Check pending requests daily
2. ✅ Accept/reject within 24 hours
3. ✅ Always provide rejection reason
4. ✅ Use reschedule for minor time changes

### For Testing:
1. 🧪 Test card: `4242 4242 4242 4242`
2. 🧪 Any future expiry date
3. 🧪 Any 3-digit CVC
4. 🧪 Any valid ZIP code

---

## ⚡ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Refresh pending | `Ctrl + R` (page) |
| Accept first | `Tab` → `Enter` |
| Refuse first | `Tab` → `Tab` → `Enter` |

---

## 📊 Status Indicators

| Status | Color | Meaning |
|--------|-------|---------|
| 🟡 PENDING | Yellow | Awaiting doctor approval |
| 🟢 CONFIRMED | Green | Doctor accepted |
| 🔴 CANCELLED | Red | Doctor rejected / Patient cancelled |
| ⚪ COMPLETED | Gray | Appointment finished |

---

## 🚨 Error Messages

### "Cannot accept appointment without successful payment"
**Cause:** Payment not completed or failed  
**Fix:** Verify payment status in database

### "Unauthorized to accept this appointment"
**Cause:** Not the assigned doctor  
**Fix:** Login with correct doctor account

### "Cannot accept appointment with status CONFIRMED"
**Cause:** Already accepted  
**Fix:** Appointment is already confirmed

---

## 🎯 Success Messages

### After Accept:
```
✅ Appointment accepted successfully!
   The patient will be notified.
```

### After Reject:
```
❌ Appointment rejected.
   A refund has been initiated for the patient.
```

---

## 📱 Mobile View

```
┌───────────────────────┐
│ 📋 Pending Requests   │
├───────────────────────┤
│ John Doe              │
│ General Consultation  │
│ Nov 10, 2:00 PM      │
│ ─────────────────────│
│ [✅] [❌] [📅]       │
└───────────────────────┘
```

---

## 🔐 Permissions Matrix

| User Type | View Pending | Accept | Reject | Reschedule |
|-----------|--------------|--------|--------|------------|
| Doctor    | Own only     | ✅     | ✅     | ✅         |
| Admin     | All          | ✅     | ✅     | ✅         |
| Patient   | Own only     | ❌     | ❌     | ❌         |

---

## 📞 Where to Find

| Feature | URL Path |
|---------|----------|
| Pending Requests | `/doctor/patients` |
| Confirmed List | `/doctor/patients` |
| Patient's View | `/patient/appointments` |
| Admin View | `/admin/appointments` |

---

## 🎬 Demo Flow

### 1. Book Appointment (Patient)
```bash
http://localhost:4200/patient/book-appointment
→ Select doctor
→ Choose date/time
→ Pay $50
→ Status: PENDING ⏳
```

### 2. Review Request (Doctor)
```bash
http://localhost:4200/doctor/patients
→ See yellow card
→ Read patient details
→ Decide: Accept or Refuse
```

### 3. Accept (Happy Path)
```bash
Click [✅ Accept]
→ Confirm dialog
→ Status: CONFIRMED ✅
→ Patient notified
→ Added to calendar
```

### 4. Reject (Refund Path)
```bash
Click [❌ Refuse]
→ Enter reason
→ Status: CANCELLED ❌
→ Refund initiated 💰
→ Patient notified
→ Money returned
```

---

## 🏁 Quick Start

```bash
# 1. Start backend
cd chifaacare-backend && npm run dev

# 2. Start frontend
cd ../.. && npm start

# 3. Open doctor portal
http://localhost:4200/doctor/patients

# 4. That's it! 🎉
```

---

**Last Updated:** November 6, 2025  
**Status:** ✅ Fully Functional  
**Version:** 1.0.0
