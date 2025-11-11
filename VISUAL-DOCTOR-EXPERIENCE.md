# 🎨 VISUAL GUIDE - Doctor Experience

## Overview

This guide shows exactly what doctors will see and do with the new appointment system.

---

## 📱 Step-by-Step Flow

### Step 1: Connect Google Calendar (One-Time Setup)

```
┌─────────────────────────────────────────┐
│  Google Calendar Integration            │
├─────────────────────────────────────────┤
│                                         │
│  📅 Connect your Google Calendar to     │
│     automatically sync appointments     │
│                                         │
│  [  Connect Google Calendar  ]          │
│                                         │
│  Benefits:                              │
│  ✓ All appointments in your calendar    │
│  ✓ Never miss an appointment            │
│  ✓ Sync with your personal schedule     │
│                                         │
└─────────────────────────────────────────┘
```

**What Happens:**
1. Doctor clicks "Connect Google Calendar"
2. Popup opens with Google OAuth
3. Doctor logs in and authorizes
4. ✅ Success! Calendar connected

**Connected View:**
```
┌─────────────────────────────────────────┐
│  Google Calendar Integration            │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Connected                           │
│  📧 doctor@example.com                  │
│                                         │
│  [  Disconnect  ]                       │
│                                         │
└─────────────────────────────────────────┘
```

---

### Step 2: View Pending Appointment Requests

```
┌──────────────────────────────────────────────────┐
│  Pending Appointment Requests (3)                │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ 👤 John Doe                               │  │
│  │ 📧 john@example.com                       │  │
│  │ 📞 +216 12 345 678                        │  │
│  ├──────────────────────────────────────────┤  │
│  │ 📅 Nov 10, 2025 at 10:00 AM              │  │
│  │ ⏱️  60 minutes                            │  │
│  │ 💰 $100 (PAID ✓)                         │  │
│  │ 📝 Reason: General consultation           │  │
│  ├──────────────────────────────────────────┤  │
│  │ [ ✓ Accept ]  [ ✗ Reject ]              │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ 👤 Sarah Smith                            │  │
│  │ 📧 sarah@example.com                      │  │
│  │ 📞 +216 98 765 432                        │  │
│  ├──────────────────────────────────────────┤  │
│  │ 📅 Nov 11, 2025 at 2:00 PM               │  │
│  │ ⏱️  30 minutes                            │  │
│  │ 💰 $75 (PAID ✓)                          │  │
│  │ 📝 Reason: Follow-up consultation         │  │
│  ├──────────────────────────────────────────┤  │
│  │ [ ✓ Accept ]  [ ✗ Reject ]              │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Key Information Shown:**
- ✓ Patient name and contact
- ✓ Date and time requested
- ✓ Duration
- ✓ Payment status (must be PAID)
- ✓ Reason for visit
- ✓ Accept/Reject buttons

---

### Step 3A: Accept Appointment

**Doctor Clicks "Accept":**

```
┌─────────────────────────────────────────┐
│  ⏳ Processing...                       │
└─────────────────────────────────────────┘

         ↓ 2 seconds later ↓

┌─────────────────────────────────────────┐
│  ✅ Appointment Accepted!               │
│                                         │
│  📅 Added to Google Calendar            │
│  📧 Patient has been notified           │
│  🔗 View in Calendar                    │
│                                         │
│  [     OK     ]                         │
└─────────────────────────────────────────┘
```

**What Happens Behind the Scenes:**
1. Appointment status → `CONFIRMED`
2. Creates event in doctor's Google Calendar:
   ```
   Title: Consultation with John Doe
   Time: Nov 10, 2025 10:00 AM - 11:00 AM
   Description:
     Reason: General consultation
     Patient Email: john@example.com
     Patient Phone: +216 12 345 678
   Attendees: john@example.com
   Reminders:
     - Email: 1 day before
     - Popup: 30 minutes before
   ```
3. Sends email to patient: "Your appointment has been confirmed!"
4. Removes from pending list

---

### Step 3B: Reject Appointment

**Doctor Clicks "Reject":**

```
┌─────────────────────────────────────────┐
│  Reject Appointment                     │
├─────────────────────────────────────────┤
│                                         │
│  Please provide a reason:               │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ Not available at this time     │    │
│  │                                │    │
│  └────────────────────────────────┘    │
│                                         │
│  [  Cancel  ]  [  Confirm Reject  ]    │
│                                         │
└─────────────────────────────────────────┘

         ↓ After confirmation ↓

┌─────────────────────────────────────────┐
│  ✅ Appointment Rejected                │
│                                         │
│  💰 Refund initiated: $100              │
│  📧 Patient has been notified           │
│                                         │
│  Patient will receive:                  │
│  • Cancellation notification            │
│  • Full refund (3-5 business days)      │
│  • Option to book another time          │
│                                         │
│  [     OK     ]                         │
└─────────────────────────────────────────┘
```

**What Happens Behind the Scenes:**
1. Appointment status → `CANCELLED`
2. Initiates full refund via Stripe/Mock
3. Sends email to patient:
   ```
   Subject: Appointment Request Declined
   
   Unfortunately, Dr. Smith is not available at your 
   requested time (Nov 10, 2025 10:00 AM).
   
   Reason: Not available at this time
   
   Your payment of $100 has been refunded and will 
   appear in your account within 3-5 business days.
   
   You can book another appointment by selecting a 
   different time slot.
   ```
4. Removes from pending list

---

### Step 4: View Calendar

**In ChifaaCare Dashboard:**

```
┌──────────────────────────────────────────────────┐
│  My Schedule - November 2025        [  Today  ]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Mon     Tue     Wed     Thu     Fri     Sat    │
│                                                  │
│          10      11      12      13      14     │
│         ┌───┐   ┌───┐                           │
│         │10a│   │2p │                           │
│         │   │   │   │                           │
│         │Joh│   │Sar│                           │
│         └───┘   └───┘                           │
│                                                  │
│  17      18      19      20      21      22     │
│  ┌───┐                                          │
│  │9a │                                          │
│  │   │                                          │
│  │Mar│                                          │
│  └───┘                                          │
│                                                  │
└──────────────────────────────────────────────────┘

Click any appointment for details
```

**In Google Calendar:**

```
                Google Calendar
        ┌──────────────────────────┐
        │   🗓️ November 2025       │
        ├──────────────────────────┤
        │                          │
        │ Wednesday, Nov 10        │
        │ ┌──────────────────────┐ │
        │ │ 10:00 AM - 11:00 AM  │ │
        │ │ Consultation with    │ │
        │ │ John Doe             │ │
        │ └──────────────────────┘ │
        │                          │
        │ Thursday, Nov 11         │
        │ ┌──────────────────────┐ │
        │ │ 2:00 PM - 2:30 PM    │ │
        │ │ Consultation with    │ │
        │ │ Sarah Smith          │ │
        │ └──────────────────────┘ │
        │                          │
        └──────────────────────────┘
```

**Calendar Event Details:**
```
When: Wednesday, November 10, 2025
      10:00 AM - 11:00 AM (1 hour)

What: Consultation with John Doe

Where: ChifaaCare Virtual Clinic

Description:
  Reason: General consultation
  Patient Email: john@example.com
  Patient Phone: +216 12 345 678
  
Guests:
  • john@example.com (Patient)
  • doctor@example.com (Organizer)
  
Reminders:
  ⏰ Email 1 day before
  ⏰ Notification 30 minutes before
```

---

### Step 5: Reschedule Appointment

**From Calendar View:**

```
┌─────────────────────────────────────────┐
│  Reschedule Appointment                 │
├─────────────────────────────────────────┤
│                                         │
│  Patient: John Doe                      │
│  Current: Nov 10, 2025 10:00 AM        │
│                                         │
│  New Date: [  Nov 12, 2025  ▼ ]       │
│  New Time: [    2:00 PM     ▼ ]       │
│                                         │
│  Duration: [  60 minutes    ▼ ]       │
│                                         │
│  Reason (optional):                     │
│  ┌────────────────────────────────┐    │
│  │ Rescheduled due to emergency   │    │
│  └────────────────────────────────┘    │
│                                         │
│  [  Cancel  ]  [  Confirm Reschedule ]│
│                                         │
└─────────────────────────────────────────┘

         ↓ After confirmation ↓

┌─────────────────────────────────────────┐
│  ✅ Appointment Rescheduled             │
│                                         │
│  📅 Updated in Google Calendar          │
│  📧 Patient has been notified           │
│                                         │
│  New time: Nov 12, 2025 at 2:00 PM     │
│                                         │
│  [     OK     ]                         │
└─────────────────────────────────────────┘
```

**What Happens:**
1. Updates appointment in database
2. Updates Google Calendar event (same event ID)
3. Sends notification to patient
4. Calendar automatically syncs

---

## 🎯 Key Features Summary

### For Doctors:

✅ **Control:** Accept or reject appointment requests  
✅ **Calendar Sync:** All appointments in Google Calendar  
✅ **Automatic:** Calendar events created automatically  
✅ **Updates:** Reschedule updates calendar too  
✅ **Notifications:** Email and popup reminders  
✅ **Patient Info:** All details in calendar event  
✅ **Refunds:** Automatic refunds when rejecting  

### Patient Experience:

✅ **Request:** Book appointment (status: PENDING)  
✅ **Pay:** Complete payment (status: still PENDING)  
✅ **Wait:** Get notified when doctor responds  
✅ **Confirmed:** If accepted → ready to go!  
✅ **Refunded:** If rejected → automatic refund  

---

## 📊 Dashboard Widgets

### Pending Requests Widget

```
┌──────────────────────────┐
│  Pending Requests        │
├──────────────────────────┤
│                          │
│   You have 3 pending     │
│   appointment requests   │
│                          │
│   [  Review Now  ]       │
│                          │
└──────────────────────────┘
```

### Today's Schedule Widget

```
┌──────────────────────────┐
│  Today's Appointments    │
├──────────────────────────┤
│                          │
│  10:00 AM - John Doe     │
│  2:00 PM - Sarah Smith   │
│  4:30 PM - Mike Johnson  │
│                          │
│  [  View Calendar  ]     │
│                          │
└──────────────────────────┘
```

### Calendar Status Widget

```
┌──────────────────────────┐
│  Google Calendar         │
├──────────────────────────┤
│                          │
│  ✅ Connected            │
│  📧 doctor@example.com   │
│  🔄 Last sync: 2 min ago │
│                          │
└──────────────────────────┘
```

---

## 🔔 Notifications

### Push Notification

```
┌────────────────────────────────┐
│  ChifaaCare                    │
├────────────────────────────────┤
│  🔔 New Appointment Request    │
│                                │
│  John Doe has requested an     │
│  appointment on Nov 10 at      │
│  10:00 AM                      │
│                                │
│  Tap to review                 │
└────────────────────────────────┘
```

### Email Notification

```
Subject: New Appointment Request

Hi Dr. Smith,

You have a new appointment request:

Patient: John Doe
Date: November 10, 2025
Time: 10:00 AM - 11:00 AM
Reason: General consultation
Payment: $100 (PAID)

[  Accept  ]  [  Reject  ]

Log in to review: https://chifaacare.com/doctor/pending
```

---

## 📱 Mobile View

```
┌─────────────────┐
│ ☰  ChifaaCare  │
├─────────────────┤
│                 │
│ Pending (3)     │
│                 │
│ ┌─────────────┐ │
│ │ John Doe    │ │
│ │ Nov 10, 10a │ │
│ │ $100 PAID   │ │
│ │ [✓] [✗]     │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Sarah Smith │ │
│ │ Nov 11, 2p  │ │
│ │ $75 PAID    │ │
│ │ [✓] [✗]     │ │
│ └─────────────┘ │
│                 │
└─────────────────┘
```

---

## 🎨 Color Coding

- 🟢 **Green** - Confirmed appointments
- 🟡 **Yellow** - Pending requests
- 🔴 **Red** - Cancelled/Rejected
- 🔵 **Blue** - Completed appointments

---

**That's it! The complete doctor experience with the new system.**

✅ Simple  
✅ Intuitive  
✅ Automated  
✅ Professional  

---

**Ready to implement the frontend?**  
Check: `QUICK-START-CALENDAR.md` for API integration examples
