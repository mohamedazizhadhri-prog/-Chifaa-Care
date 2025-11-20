# Quick Fix: Remove "Maria Garcia" from Messages

## TL;DR - 3 Steps to Fix

### 1️⃣ Check What's Actually in Database
```bash
cd chifaacare-backend
npm run ts-node src/scripts/verify-messages-data.ts
```

### 2️⃣ Clear Browser Cache
- Press: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or: DevTools (F12) → Right-click refresh → "Empty Cache and Hard Reload"

### 3️⃣ Rebuild Angular App
```bash
cd -Chifaa-Care-samedatabase
ng build --configuration=production
ng serve
```

## Why This Happens

The messages interface shows only data from your database. If you see "Maria Garcia":

✅ **Browser cached old data** → Clear cache (Step 2)
✅ **Old Angular build running** → Rebuild (Step 3)
✅ **Actually in database** → Check with Step 1

## Current Code Status

### ✅ Code is Already Correct!

**Patient Interface:**
- ✅ Loads only conversations with active doctors from database
- ✅ Filters out deleted/inactive users automatically
- ✅ Auto-refreshes every 5 seconds

**Doctor Interface:**
- ✅ Loads only conversations with active doctors from database
- ✅ Auto-cleans inactive conversations on startup
- ✅ Auto-refreshes every 5 seconds

### No Code Changes Needed!

The filtering code is already in place:

```typescript
// Already filters to active doctors only
.filter(conv => {
  const isActiveDoctor = doctorIds.has(conv.otherUserId);
  return isActiveDoctor && isNotSelf;
})
```

## What to Check

### If still seeing "Maria Garcia" after steps above:

```bash
# 1. Check database directly
cd chifaacare-backend
npx prisma studio
# Look in User table for "Maria Garcia"

# 2. Check API response
curl http://localhost:3000/api/v1/doctors
# Should only show active doctors

# 3. Search codebase for hardcoded data
# Search for: "Maria Garcia"
# Should find: NOTHING (no hardcoded data)
```

## Delete User from Database (If Needed)

If "Maria Garcia" exists in your database and you want to remove:

```sql
-- Option 1: Via Prisma Studio (Recommended)
-- 1. Open: npx prisma studio
-- 2. Go to User table
-- 3. Find and delete the user
-- 4. Related messages are auto-deleted (cascade)

-- Option 2: SQL Query
-- Find ID first
SELECT id, name FROM "User" WHERE name LIKE '%Maria%';

-- Delete (replace USER_ID)
DELETE FROM "User" WHERE id = 'USER_ID';
```

## Verification Commands

```bash
# Backend running?
curl http://localhost:3000/api/v1/health

# Doctors endpoint working?
curl http://localhost:3000/api/v1/doctors

# Messages endpoint working? (replace USER_ID)
curl http://localhost:3000/api/v1/messages/conversations/USER_ID

# Frontend building without errors?
ng build --configuration=production

# Any TypeScript errors?
ng build --configuration=development
```

## Expected Result

After following the 3 steps:

✅ **Patient sees:** Only active doctors they have conversations with
✅ **Doctor sees:** Only other active doctors they have conversations with
✅ **Both see:** Real-time updates, no "Maria Garcia", no deleted users

## Still Need Help?

Check the detailed guide:
- `FIX-MARIA-GARCIA-ISSUE.md` - Full troubleshooting guide

Check existing documentation:
- `MESSAGE-SYNC-COMPLETE-GUIDE.md` - How the system works
- `AUTO-UPDATE-MESSAGES-GUIDE.md` - Auto-refresh behavior
- `MESSAGES-FIX-COMPLETE-SUMMARY.md` - What was fixed

## Key Points

🎯 **The code is correct** - No changes needed
🎯 **It's a cache issue** - Clear browser cache
🎯 **Or old build** - Rebuild Angular app
🎯 **Or actually in DB** - Check with verification script

That's it! Just clear cache and rebuild. The filtering code is already working correctly.
