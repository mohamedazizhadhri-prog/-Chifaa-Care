# 🔧 LOGIN & DATABASE TROUBLESHOOTING GUIDE

## ❌ Problem: Doctor Signup Not Working

The issue is likely **NOT** related to the ad-banner changes I made. The ad-banner component only affects the UI, not authentication or backend connection.

---

## 🔍 Diagnosis Steps

### Step 1: Check if Backend is Running

```bash
# In terminal/command prompt:
cd chifaacare-backend
npm start

# OR use the batch file:
start-backend.bat
```

**Expected Output:**
```
Server running on port 3000
Database connected successfully
```

### Step 2: Test Backend Connection

**Double-click this file:** `test-backend-connection.bat`

This will:
- ✅ Check if backend is running
- ✅ Test database connection
- ✅ Test signup endpoint
- ✅ Test login endpoint

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to backend"

**Symptoms:**
- Error: "Unable to connect to the server"
- Network error in browser console
- CORS errors

**Solution:**

1. **Check backend is running:**
   ```bash
   cd chifaa-backend
   npm start
   ```

2. **Check .env file** (`chifaacare-backend/.env`):
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_HeYafdV3i6QC@ep-lively-sound-agfp605h-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="chifaacare_super_secret_jwt_key_2024_production"
   PORT=3000
   CORS_ORIGIN="http://localhost:4200"
   ```

3. **Verify CORS settings** in backend:
   - File: `src/app.ts` or `src/main.ts`
   - Should allow `http://localhost:4200`

---

### Issue 2: "Database connection failed"

**Symptoms:**
- "Unable to connect to database"
- Prisma client errors
- Timeout errors

**Solution:**

1. **Check DATABASE_URL in `.env`:**
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_HeYafdV3i6QC@ep-lively-sound-agfp605h-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
   ```

2. **Test database connection:**
   ```bash
   cd chifaacare-backend
   node test-connection.js
   ```

3. **Regenerate Prisma Client:**
   ```bash
   cd chifaacare-backend
   npx prisma generate
   npx prisma db push
   ```

---

### Issue 3: "Signup validation errors"

**Symptoms:**
- "Invalid data"
- "Missing required fields"
- Validation error messages

**Solution:**

The backend expects these fields for doctor signup:

```javascript
{
  email: "doctor@example.com",
  password: "Password123!",
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890",
  role: "DOCTOR",  // Must be uppercase
  specialization: "Cardiology",
  
  // Optional:
  licenseNumber: "MED123456",
  experience: 5,
  consultationFee: 100,
  bio: "Experienced cardiologist..."
}
```

**Fix in Frontend:**

The auth form already sends the correct data format. Check:
- File: `src/app/components/auth/auth-page.component.ts`
- Line 273: `role: userData.role.toUpperCase()`

This converts "doctor" → "DOCTOR" for the backend.

---

### Issue 4: "JWT secret not found"

**Symptoms:**
- "JWT secret undefined"
- Token generation fails

**Solution:**

Add JWT_SECRET to `.env`:
```env
JWT_SECRET="chifaacare_super_secret_jwt_key_2024_production"
JWT_EXPIRES_IN="7d"
```

Then restart backend:
```bash
cd chifaacare-backend
npm start
```

---

### Issue 5: "User already exists"

**Symptoms:**
- "User already exists with this email"
- Cannot create account

**Solution:**

Either:
1. Use a different email address
2. Delete the existing user from database:
   ```bash
   cd chifaacare-backend
   node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.delete({ where: { email: 'doctor@test.com' } }).then(() => console.log('User deleted')).catch(console.error);"
   ```

---

## 📝 Detailed Debug Checklist

### Backend Checklist ✅

- [ ] Backend server is running on port 3000
- [ ] `.env` file exists in `chifaacare-backend/`
- [ ] `DATABASE_URL` is correct in `.env`
- [ ] `JWT_SECRET` is set in `.env`
- [ ] CORS allows `http://localhost:4200`
- [ ] Prisma client is generated (`npx prisma generate`)
- [ ] Database tables exist (`npx prisma db push`)
- [ ] No error messages in backend console

### Frontend Checklist ✅

- [ ] Angular dev server running on port 4200
- [ ] Browser console shows no errors
- [ ] Network tab shows requests to `http://localhost:3000`
- [ ] Auth service API URL is correct
- [ ] All required form fields are filled
- [ ] Password meets requirements (min 8 chars)

### Database Checklist ✅

- [ ] Neon database is accessible
- [ ] Connection string is correct
- [ ] SSL mode is set correctly
- [ ] User table exists
- [ ] DoctorProfile table exists
- [ ] PatientProfile table exists

---

## 🔬 Manual Testing

### Test Doctor Signup (Using curl or Postman)

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor123@test.com",
    "password": "Test1234!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "DOCTOR",
    "specialization": "Cardiology",
    "licenseNumber": "MED123456",
    "experience": 5,
    "consultationFee": 100,
    "bio": "Experienced cardiologist"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "...",
      "email": "doctor123@test.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "DOCTOR"
    }
  }
}
```

### Test Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor123@test.com",
    "password": "Test1234!"
  }'
```

---

## 🚨 Emergency Fix

If nothing works, do a **complete reset**:

```bash
# 1. Stop all servers
# Press Ctrl+C in all terminals

# 2. Clean backend
cd chifaacare-backend
rm -rf node_modules
npm install
npx prisma generate
npx prisma db push

# 3. Restart backend
npm start

# 4. In another terminal, start frontend
cd ..
ng serve

# 5. Try signup again
```

---

## 📊 Check Backend Logs

When you try to signup, check the backend console for errors:

**Look for:**
- `[Auth] Login attempt for: ...`
- `Signup error: ...`
- Database connection errors
- Validation errors
- JWT errors

**Example Good Log:**
```
[Auth] Login attempt for: doctor@test.com
[Auth] Searching user in database
[Auth] Comparing passwords
[Auth] Generating JWT token
[Auth] Login successful for: doctor@test.com
```

**Example Bad Log:**
```
Signup error: [Error details here]
```

---

## 🔗 Verify API Endpoints

Open browser and check:

1. **Health Check:**
   ```
   http://localhost:3000/health
   ```
   Should return: `{"status":"ok"}`

2. **API Base:**
   ```
   http://localhost:3000/api/v1
   ```

3. **Check environment file in frontend:**
   ```typescript
   // src/environments/environment.ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api/v1'
   };
   ```

---

## 💡 Quick Fixes

### Fix 1: Reset .env file

```bash
cd chifaacare-backend
# Copy this content to .env:
```

```env
DATABASE_URL="postgresql://neondb_owner:npg_HeYafdV3i6QC@ep-lively-sound-agfp605h-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="chifaacare_super_secret_jwt_key_2024_production"
JWT_EXPIRES_IN="7d"
ENCRYPTION_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:4200"
```

### Fix 2: Regenerate Database

```bash
cd chifaacare-backend
npx prisma db push --force-reset
npx prisma generate
```

⚠️ **Warning:** This will delete all data!

### Fix 3: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Click "Empty Cache and Hard Reload"
4. Or go to Application → Clear Storage → Clear site data

---

## 📞 Still Not Working?

If signup still doesn't work after all these steps:

1. **Run the test script:**
   ```bash
   test-backend-connection.bat
   ```

2. **Check browser console** (F12 → Console tab)
   - Look for red error messages
   - Copy the full error message

3. **Check backend console**
   - Look for error messages
   - Copy the full error stack trace

4. **Verify the request:**
   - Open Network tab in DevTools (F12)
   - Click on the signup request
   - Check Request Payload
   - Check Response

5. **Take screenshots of:**
   - Frontend form with error
   - Browser console errors
   - Backend console errors
   - Network tab request/response

---

## ✅ Success Indicators

You'll know it's working when:

1. **Backend console shows:**
   ```
   User created successfully
   ```

2. **Frontend shows:**
   - ID badge animation appears
   - Redirects to doctor dashboard

3. **Browser console shows:**
   ```
   Login successful
   User data: { id: '...', name: '...', role: 'doctor' }
   ```

4. **Database has new record:**
   ```bash
   # Check database
   node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.findMany().then(users => console.log(users));"
   ```

---

## 📝 Important Notes

1. **The ad-banner changes did NOT affect authentication**
   - Only UI components were modified
   - No backend or auth files were changed
   - Database connection is independent

2. **If it worked before and stopped:**
   - Backend might have stopped running
   - Database connection might have timed out
   - .env file might have been modified

3. **Common mistakes:**
   - Forgetting to start backend
   - Wrong DATABASE_URL
   - Missing JWT_SECRET
   - CORS not configured properly
   - Using wrong port numbers

---

## 🎯 Next Steps

1. Run `test-backend-connection.bat`
2. Check backend is running
3. Verify .env file is correct
4. Try signup again
5. Check browser console for errors
6. Check backend console for errors

Good luck! 🚀
