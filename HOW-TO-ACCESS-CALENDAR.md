# 📅 HOW TO ACCESS GOOGLE CALENDAR IN YOUR WEBSITE

## 🎯 Quick Access

### For Doctors:
1. **Login as a Doctor** on your website
2. Go to the **Doctor Dashboard** (after login you'll automatically be there)
3. Look at the **left sidebar menu**
4. Click on **"Calendar"** 📅 (first item in the doctor menu)
5. You will see your **weekly appointment calendar** with all confirmed appointments

### Direct URL:
```
http://localhost:4200/doctor/calendar
```

---

## 📍 What You'll See on the Calendar Page

### **Weekly Calendar View**
- 📅 Shows appointments for the current week (Monday-Sunday)
- ⏰ Time slots from 8:00 AM to 6:00 PM
- 📊 All your confirmed appointments displayed in their time slots
- 🔵 Today's date is highlighted

### **Navigation Controls**
- ⬅️ **Previous Week** button
- ➡️ **Next Week** button  
- 🏠 **Today** button (go back to current week)

### **Appointment Cards Show:**
- 👤 Patient name
- ⏰ Start and end time
- 📝 Reason for visit
- 🏷️ Status badge (PENDING, CONFIRMED, CANCELLED)
- 📧 Patient email

### **Actions Available:**
When you click on an appointment:
- ✅ **Accept** - Confirm a pending appointment
- ❌ **Reject** - Cancel the appointment
- 🔄 **Reschedule** - Change date/time
- 👁️ **View Details** - See full information

---

## 🔗 Backend API Endpoints Available

Your backend already has these Google Calendar endpoints ready:

### 1. **Connect Google Calendar**
```
GET http://localhost:3000/api/v1/calendar/auth
```
This starts the OAuth flow to connect your Google Calendar

### 2. **Check Connection Status**
```
GET http://localhost:3000/api/v1/calendar/status
```
See if Google Calendar is connected

### 3. **Disconnect Calendar**
```
POST http://localhost:3000/api/v1/calendar/disconnect
```
Remove Google Calendar connection

### 4. **Sync Appointments**
When you accept an appointment, it automatically:
- ✅ Creates an event in your Google Calendar
- 📧 Sends calendar invites
- 🔔 Sets up reminders

---

## 🚀 How to Use Google Calendar Integration

### **Step 1: Connect Your Google Calendar** (Optional)
1. Go to Calendar page (`/doctor/calendar`)
2. Click **"Connect Google Calendar"** button (if shown)
3. Login with your Google account
4. Grant permissions
5. Your calendar is now synced! 🎉

### **Step 2: Manage Appointments**
1. **View Appointments**: See all appointments in the weekly calendar
2. **Accept Pending**: Click appointment → Accept → It appears in your Google Calendar
3. **Reschedule**: Click appointment → Reschedule → Pick new date/time
4. **View in Google**: Accepted appointments sync to Google Calendar automatically

---

## 📊 Current Features

### ✅ **What Works Now:**
- Weekly calendar view with all appointments
- See confirmed and pending appointments  
- Accept/reject appointment requests
- Reschedule appointments
- View patient details
- Navigate between weeks
- Today highlight

### 🚧 **Google Calendar Sync** (Requires Setup):
To enable actual Google Calendar synchronization:
1. The database columns need to be added (run `fix-db-direct.bat`)
2. Backend is ready with all OAuth endpoints
3. Frontend can call the sync endpoints

---

## 🎨 Calendar Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│  Calendar                            <  TODAY  >        │
├─────────────────────────────────────────────────────────┤
│      MON   TUE   WED   THU   FRI   SAT   SUN          │
│       6     7     8     9    10    11    12           │
├──────┬────┬────┬────┬────┬────┬────┬────┬────────────┤
│ 8:00 │    │    │ 👤 │    │    │    │    │            │
│ 9:00 │ 👤 │    │    │    │    │    │    │  Patient   │
│10:00 │    │    │    │ 👤 │    │    │    │  John Doe  │
│11:00 │    │    │    │    │    │    │    │  10:00 AM  │
│12:00 │    │    │    │    │ 👤 │    │    │  Checkup   │
│13:00 │    │    │    │    │    │    │    │            │
│14:00 │    │ 👤 │    │    │    │    │    │  CONFIRMED │
│15:00 │    │    │    │    │    │    │    │            │
└──────┴────┴────┴────┴────┴────┴────┴────┴────────────┘
```

---

## 🔍 Finding the Calendar Feature

### **In the Navigation Menu:**
After logging in as a doctor, look for:
```
📊 Dashboard
📅 Calendar         ← YOU ARE HERE!
👤 Patients
🎥 Consultations
📋 Treatment Management
🤖 AI Reports
💬 Messages
⚙️ Settings
```

### **File Locations in Code:**
- **Frontend Component**: `src/app/portals/doctor/calendar/doctor-calendar.component.ts`
- **Backend Controller**: `chifaacare-backend/src/controllers/calendar.controller.ts`
- **Backend Service**: `chifaacare-backend/src/services/google-calendar.service.ts`
- **Backend Routes**: `chifaacare-backend/src/routes/calendar.routes.ts`

---

## ⚠️ Important Notes

1. **First run `fix-db-direct.bat`** to add the required database columns
2. **Login as a doctor** - Calendar is only visible to doctors
3. **Appointments must be CONFIRMED** to show in calendar
4. **Google sync is optional** - Calendar works without it

---

## 📞 Quick Help

**Calendar not showing?**
- Make sure you're logged in as a DOCTOR
- Check the left sidebar menu
- Try accessing: `http://localhost:4200/doctor/calendar`

**No appointments showing?**
- Make sure appointments are CONFIRMED status
- Check if appointments are within the current week
- Navigate to different weeks using the arrows

**Want Google sync?**
- Run the database fix first: `fix-db-direct.bat`
- Restart your backend server
- The "Connect Google Calendar" button will appear

---

## ✅ Success Checklist

- [ ] Database fix completed (`fix-db-direct.bat`)
- [ ] Backend server restarted
- [ ] Frontend server running
- [ ] Logged in as a doctor
- [ ] Calendar visible in sidebar
- [ ] Can see appointments
- [ ] Can navigate weeks
- [ ] Actions work (accept/reject/reschedule)

---

**Last Updated**: November 5, 2025
**Status**: ✅ Calendar Feature Enabled
**Access Level**: Doctors Only
