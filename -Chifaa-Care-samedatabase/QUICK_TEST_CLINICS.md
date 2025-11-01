# 🚀 Quick Start Guide - Testing Clinics Feature

## ⚡ Fast Setup (5 Minutes)

### Step 1: Start Backend (Terminal 1)
```bash
cd chifaacare-backend
npm run dev
```

Wait for:
```
✓ Server running on http://localhost:3000
✓ Database connected
```

---

### Step 2: Start Frontend (Terminal 2)
```bash
# From project root
npm start
```

Wait for:
```
✓ Compiled successfully
Local: http://localhost:4200
```

---

### Step 3: Login as Admin

1. Open browser: **http://localhost:4200**
2. Click **Login**
3. Use admin credentials:
   - **Email:** `admin@chifaacare.com`
   - **Password:** Your admin password

**Don't have admin credentials?** Create them:
```bash
cd chifaacare-backend
npm run create:accounts
```
This will show the admin password in the console.

---

### Step 4: Access Clinics Management

1. After login, go to **Admin Portal**
2. Click **Clinics** in the sidebar
3. You should see the Clinics Management page

---

## ✅ Test Scenarios

### Test 1: Create a Clinic ✨

1. Click **"Add Clinic"** button
2. Fill in the form:

**Basic Information:**
- **Name:** `Sunrise Medical Center`
- **Email:** `contact@sunrisemedical.com`
- **Phone:** `+1-555-0123`

**Location:**
- **Address:** `456 Health Avenue`
- **City:** `San Francisco`
- **State:** `California`
- **Country:** `United States`
- **Postal Code:** `94102`

**Status & Onboarding:**
- **Status:** `PENDING`
- **Onboarding Step:** `REGISTRATION`

3. Click **"Save"**
4. ✅ Success toast appears
5. ✅ Clinic appears in table

---

### Test 2: Search & Filter 🔍

**Search Test:**
1. Type `Sunrise` in search box
2. ✅ Only matching clinics show

**Filter Test:**
1. Select **"Pending"** from status filter
2. ✅ Only pending clinics show
3. Click **X** to clear filter
4. ✅ All clinics show again

---

### Test 3: Edit a Clinic ✏️

1. Click **pencil icon** on any clinic
2. Change **Status** to `ACTIVE`
3. Change **Onboarding Step** to `DOCUMENT_UPLOAD`
4. Click **"Save"**
5. ✅ Changes appear in table
6. ✅ Status badge turns green

---

### Test 4: Delete a Clinic 🗑️

1. Click **trash icon** on a clinic
2. Confirm deletion dialog appears
3. Click **"Yes"**
4. ✅ Success toast appears
5. ✅ Clinic removed from table

---

## 🐛 Troubleshooting

### Problem: "Can't find /api/v1/admin/clinics"

**Check:**
```bash
# Is backend running?
curl http://localhost:3000/api/health

# Should return: {"status":"success"}
```

**Fix:**
1. Make sure backend is running on port 3000
2. Restart backend: `npm run dev`
3. Check console for errors

---

### Problem: "Failed to load clinics"

**Check:**
1. Are you logged in as admin?
2. Check browser console (F12) for errors
3. Check backend terminal for errors

**Fix:**
```bash
# Test database connection
cd chifaacare-backend
npm run test:neon

# If database fails, check .env file
```

---

### Problem: Empty table, but no error

**This means:**
- ✅ API is working
- ✅ You just don't have any clinics yet
- 📝 Click "Add Clinic" to create one

---

## 🎯 Quick Create Test Clinic

Want to quickly add test data? Run this in backend directory:

```bash
cd chifaacare-backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestClinics() {
  const clinics = [
    {
      name: 'Sunrise Medical Center',
      email: 'contact@sunrise.com',
      phone: '+1-555-0123',
      address: '456 Health Ave',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94102',
      status: 'ACTIVE',
      onboardingStep: 'COMPLETED'
    },
    {
      name: 'Downtown Clinic',
      email: 'info@downtown.com',
      phone: '+1-555-0456',
      address: '789 Medical St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      status: 'PENDING',
      onboardingStep: 'REGISTRATION'
    }
  ];

  for (const clinic of clinics) {
    try {
      await prisma.clinic.create({ data: clinic });
      console.log('✅ Created:', clinic.name);
    } catch (e) {
      console.log('Already exists:', clinic.name);
    }
  }
  
  await prisma.\$disconnect();
}

createTestClinics();
"
```

---

## 📊 Verify Everything Works

### Backend Health Check
```bash
curl http://localhost:3000/api/health
```
**Expected:** `{"status":"success"}`

### Frontend Check
Open: **http://localhost:4200**
**Expected:** Homepage loads

### API Check (with auth token)
```bash
# First login to get token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chifaacare.com","password":"YOUR_PASSWORD"}'

# Then use token to get clinics
curl http://localhost:3000/api/v1/admin/clinics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎉 Success Checklist

After completing tests, you should have:

- [x] Backend running on port 3000
- [x] Frontend running on port 4200
- [x] Logged in as admin
- [x] Clinics page loads without errors
- [x] Can create new clinics
- [x] Can search and filter clinics
- [x] Can edit clinics
- [x] Can delete clinics
- [x] Status badges show correct colors
- [x] Success/error toasts appear

---

## 🔥 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Kill process: `taskkill /F /IM node.exe` (Windows) |
| Port 4200 in use | Kill Angular: Close terminal and restart |
| Database error | Run: `npm run db:test` |
| Login fails | Check credentials with: `npm run create:accounts` |
| Blank page | Clear browser cache (Ctrl+Shift+Del) |
| API 401 error | Token expired, login again |

---

## 📞 Need Help?

If clinics feature still doesn't work:

1. **Check backend logs** - Look for errors in terminal
2. **Check browser console** - Press F12, look for red errors
3. **Check network tab** - F12 → Network, see failed requests
4. **Restart everything** - Close all terminals, start fresh

**Still stuck?** Check these files:
- Backend routes: `chifaacare-backend/src/routes/admin.routes.ts`
- Backend controller: `chifaacare-backend/src/controllers/admin.controller.ts`
- Frontend service: `src/app/services/admin.service.ts`
- Frontend component: `src/app/portals/admin/clinics/admin-clinics.component.ts`

---

**Status: Ready to Test! 🚀**
