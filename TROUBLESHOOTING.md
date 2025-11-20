# 🔧 Database Connection Troubleshooting

## Your Issue
Frontend loads but doctors/patients aren't showing up in the interface.

## Quick Diagnosis

### Step 1: Check if Backend is Running
```bash
cd chifaacare-backend
node test-api-endpoints.js
```

This will test:
- ✅ Backend server health
- ✅ Doctors endpoint
- ✅ Patients endpoint  
- ✅ Login functionality
- ✅ Data in database

### Step 2: Check Database Content
```bash
node check-database-data.js
```

Expected output should show:
```
👨‍⚕️  Doctors: 5+
🏥 Patients: 3+
🏢 Clinics: 1+
```

## Common Issues & Solutions

### Issue 1: "0 Doctors found"
**Cause:** Database is empty or not connected

**Solution:**
```bash
# Check Prisma connection
npx prisma studio

# If empty, seed the database
npm run seed:safe

# Or create specific accounts
node create-test-accounts.js
node create-clinics.js
```

### Issue 2: "CORS Error" in Browser Console
**Cause:** Backend not allowing frontend requests

**Check:** Open browser console (F12) and look for red errors like:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/v1/doctors' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solution:** Backend should already have CORS enabled. Verify in `src/index.ts`:
```typescript
app.use(cors());
```

### Issue 3: "401 Unauthorized" in Console
**Cause:** Frontend trying to access protected endpoints without login

**Solution:** 
1. Make sure you're logged in
2. Check if token is saved in localStorage:
   - Open browser console (F12)
   - Go to Application > Local Storage
   - Look for `token` key

### Issue 4: "Cannot GET /api/v1/doctors" (404)
**Cause:** Backend routes not properly configured or backend not running

**Solution:**
```bash
# Restart backend
cd chifaacare-backend
npm run dev
```

Check console should show:
```
Server is running on port 3000 in development mode
```

### Issue 5: Frontend shows empty lists but no errors
**Cause:** API returning empty arrays successfully

**Debug Steps:**
1. Open browser console (F12)
2. Go to Network tab
3. Refresh page
4. Look for `/doctors` or `/patients` requests
5. Click on request and check:
   - Status: Should be 200
   - Response: Check if `data.doctors` or `data.patients` array is empty

## Testing Workflow

### 1. Start Backend
```bash
cd chifaacare-backend
npm run dev
```

Expected output:
```
Server is running on port 3000 in development mode
API Documentation: http://localhost:3000/api-docs
```

### 2. Test Backend Endpoints
In a new terminal:
```bash
cd chifaacare-backend
node test-api-endpoints.js
```

Should show:
```
✅ Health Check: { status: 'ok' }
✅ Doctors: 5+ doctors found
✅ Login Successful
```

### 3. Start Frontend
```bash
cd ..
npm start
```

### 4. Test in Browser
1. Open http://localhost:4200
2. Open browser console (F12)
3. Look for:
   - ✅ "Fetching doctors from: http://localhost:3000/api/v1/doctors"
   - ✅ "API Response: { status: 'success', results: 5, data: {...} }"
   - ❌ Any red errors

## Browser Console Debug Commands

Open browser console (F12) and run:

```javascript
// Check if API is reachable
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log);

// Check doctors endpoint
fetch('http://localhost:3000/api/v1/doctors')
  .then(r => r.json())
  .then(console.log);

// Check localStorage token
console.log('Token:', localStorage.getItem('token'));
```

## Complete Reset (if nothing works)

```bash
cd chifaacare-backend

# Stop all servers (Ctrl+C in terminal windows)

# Reset database and reseed
npx prisma migrate reset --force

# Seed with test data
npm run seed:safe

# Restart everything
cd ..
start-all.bat
```

## What to Share for Help

If issue persists, run and share output of:

```bash
cd chifaacare-backend

# 1. Database check
node check-database-data.js

# 2. API test
node test-api-endpoints.js

# 3. Environment check
type .env
```

Also share:
- Browser console errors (screenshot or text)
- Network tab showing API requests (F12 > Network > filter by "doctors" or "patients")
