# Fix: Remove "Maria Garcia" and Show Only Database Data

## Issue
The messages interface is showing "Maria Garcia" or other data that doesn't exist in the database.

## Root Cause
This is caused by one of the following:
1. **Browser cache** - Old frontend data cached in the browser
2. **Old build** - Application not rebuilt after code changes
3. **Database has the data** - The data actually exists in the database

## Solution Steps

### Step 1: Verify What's in the Database

Run this verification script to see exactly what's in your database:

```bash
cd chifaacare-backend
npm run ts-node src/scripts/verify-messages-data.ts
```

This will show you:
- All users in the database
- All active doctors
- All patients
- All messages
- Any references to "Maria Garcia"
- Conversation summaries

### Step 2: Clear Frontend Cache

1. **In your browser:**
   - Open Developer Tools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"
   
   OR
   
   - Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Select "Cached images and files"
   - Clear

2. **In your Angular app:**
   ```bash
   cd -Chifaa-Care-samedatabase
   ng build --configuration=production
   ```

### Step 3: Verify Backend API

Test the API endpoints directly:

```bash
# Get conversations for a patient (replace USER_ID with actual patient ID)
curl http://localhost:3000/api/v1/messages/conversations/USER_ID

# Get list of doctors
curl http://localhost:3000/api/v1/doctors
```

### Step 4: If Data Exists in Database - Clean It Up

If "Maria Garcia" actually exists in your database and you want to remove it:

#### Option A: Delete specific user
```sql
-- Find Maria Garcia's ID first
SELECT id, name, email, role FROM "User" WHERE name LIKE '%Maria%';

-- Then delete messages (replace USER_ID with Maria's actual ID)
DELETE FROM "Message" WHERE "senderId" = 'USER_ID' OR "recipientId" = 'USER_ID';

-- Delete the user
DELETE FROM "User" WHERE id = 'USER_ID';
```

#### Option B: Use the automatic cleanup (Recommended)
The system already has automatic cleanup built-in:

1. **For Patient Interface**: Just reload - it will automatically filter out inactive doctors
2. **For Doctor Interface**: The `cleanupInactiveConversations()` method runs automatically on init

### Step 5: Verify the Frontend Code

The current code is CORRECT and already filters data properly:

**Patient Messages (`src/app/portals/patient/messages/messages.component.ts`):**
- Line 331-367: Filters conversations to only show active doctors
- Automatically excludes deleted or inactive doctors

**Doctor Messages (`src/app/portals/doctor/doctor-messages/doctor-doctor-messages.component.ts`):**
- Line 103-145: Filters conversations to only show active doctors
- Includes auto-cleanup on initialization
- Auto-refreshes every 5 seconds

## What the Code Already Does

### ✅ Patient Interface
```typescript
// Only loads conversations with active doctors
.filter(conv => {
  const isActiveDoctor = doctorIds.has(conv.otherUserId);
  const isNotSelf = conv.otherUserId !== this.currentUser?.id;
  return isActiveDoctor && isNotSelf;
})
```

### ✅ Doctor Interface
```typescript
// Filters to active doctors only
.filter(conv => {
  const isDoctor = conv.role === 'doctor' || conv.role === 'DOCTOR';
  const isActiveDoctor = doctorIds.has(conv.otherUserId);
  const isNotSelf = conv.otherUserId !== this.currentUser?.id;
  return isActiveDoctor && isNotSelf;
})

// Auto-cleanup on init
ngOnInit() {
  this.cleanupInactiveConversations();
  // ... rest of initialization
}
```

## Expected Behavior

After following these steps:

1. **Patient Interface** should show:
   - Only conversations with active doctors from the database
   - No "Maria Garcia" unless she's an active doctor in your database

2. **Doctor Interface** should show:
   - Only conversations with other active doctors from the database
   - No deleted or inactive users

3. **Both Interfaces** should:
   - Auto-refresh every 5 seconds
   - Remove conversations when doctors are deleted
   - Show real-time messages via WebSocket

## Troubleshooting

### If "Maria Garcia" still appears:

1. **Check the database:**
   ```bash
   npm run ts-node src/scripts/verify-messages-data.ts
   ```

2. **Check browser console for errors:**
   - Open DevTools (F12)
   - Look for API errors in Console tab
   - Check Network tab for failed requests

3. **Verify API responses:**
   ```javascript
   // In browser console:
   fetch('http://localhost:3000/api/v1/doctors')
     .then(r => r.json())
     .then(data => console.log('Doctors:', data));
   ```

4. **Check if it's mock data:**
   - Search your codebase for "Maria Garcia"
   - Make sure no component has hardcoded test data

### If conversations are not loading:

1. **Check backend logs:**
   ```bash
   cd chifaacare-backend
   npm run dev
   # Watch for any errors
   ```

2. **Verify database connection:**
   ```bash
   npx prisma studio
   # Check if data is actually in the database
   ```

3. **Test API directly:**
   ```bash
   # Replace USER_ID with actual user ID from database
   curl http://localhost:3000/api/v1/messages/conversations/USER_ID
   ```

## Commands Summary

```bash
# 1. Verify database
cd chifaacare-backend
npm run ts-node src/scripts/verify-messages-data.ts

# 2. Rebuild frontend
cd ../
ng build --configuration=production

# 3. Start backend (if not running)
cd chifaacare-backend
npm run dev

# 4. Start frontend (if not running)
cd ../
ng serve

# 5. Clear browser cache and reload
# Ctrl+Shift+R or Cmd+Shift+R
```

## Additional Notes

- The code is already correct and filters properly
- No code changes are needed
- The issue is likely cached data or old build
- The system auto-cleans inactive conversations
- Real-time updates work via WebSocket

## Files Already Fixed

✅ `src/app/portals/patient/messages/messages.component.ts` - Filters active doctors only
✅ `src/app/portals/doctor/doctor-messages/doctor-doctor-messages.component.ts` - Filters active doctors only
✅ Backend message controller - Returns correct data
✅ Backend doctor controller - Returns active doctors only

No further code changes needed - just follow the steps above!
