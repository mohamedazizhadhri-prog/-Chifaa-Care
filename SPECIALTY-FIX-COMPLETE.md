# Doctor Specialty & Signup Fix - Complete Guide

## Problem Fixed
1. ✅ Signup form only showing 4 specialties instead of 10
2. ✅ Selected specialty not being saved to database
3. ✅ Missing doctor profile fields (bio, license, experience, fee) not being saved

## Changes Made

### 1. Frontend - Signup Form (`src/app/components/auth/auth-page.component.ts`)
- Changed "Specialization" input field to a dropdown select menu
- Added all 10 cancer care specialties:
  - Medical Oncologist
  - Surgical Oncologist
  - Radiation Oncologist
  - Hematologist-Oncologist (blood cancers)
  - Breast Oncologist
  - Gynecologic Oncologist
  - Urologic / Genitourinary Oncologist
  - Gastrointestinal (GI) Oncologist
  - Thoracic Oncologist (lung cancer)
  - Pediatric Oncologist

### 2. Frontend - Book Consultation Filter (`src/app/portals/patient/book-consultation/book-consultation.component.ts`)
- Updated the specialty filter dropdown to use the same 10 cancer care specialties

### 3. Backend - Auth Controller (`chifaacare-backend/src/controllers/auth.controller.ts`)
- Fixed doctor profile creation to save ALL fields:
  - ✅ specialization
  - ✅ bio
  - ✅ licenseNumber
  - ✅ experience (as integer)
  - ✅ consultationFee (as float, default: $50.00)
- Fixed patient profile creation to save optional fields:
  - ✅ bloodType
  - ✅ height (as float)
  - ✅ weight (as float)

### 4. Database Schema (`chifaacare-backend/prisma/schema.prisma`)
- Added missing `rating` field to DoctorProfile model (default: 0.0)

## Steps to Apply Changes

### Step 1: Update the Database Schema
Run these commands in your backend directory:

```bash
cd chifaacare-backend
npx prisma migrate dev --name add-doctor-rating
npx prisma generate
```

This will add the `rating` field to your doctor_profiles table.

### Step 2: Restart Your Backend Server
```bash
npm run dev
# or
npm start
```

### Step 3: Restart Your Frontend Server
```bash
cd ..
ng serve
# or
npm start
```

### Step 4: Update Existing Doctors in Database

Use these exact values when updating existing doctors' specialties:

```sql
-- Example: Update a doctor's specialty
UPDATE doctor_profiles 
SET specialization = 'Medical Oncologist' 
WHERE user_id = 'doctor_id_here';

-- List of exact values to use (copy-paste these):
'Medical Oncologist'
'Surgical Oncologist'
'Radiation Oncologist'
'Hematologist-Oncologist'
'Breast Oncologist'
'Gynecologic Oncologist'
'Urologic Oncologist'
'Gastrointestinal Oncologist'
'Thoracic Oncologist'
'Pediatric Oncologist'
```

**IMPORTANT DATABASE VALUE RULES:**
- ✅ Case sensitive - use exact capitalization as shown
- ✅ Single space between words
- ✅ Hyphen (-) in "Hematologist-Oncologist"
- ❌ NO parentheses like "(blood cancers)" - those are only in the UI
- ❌ NO extra spaces

## Test the Fix

### Test 1: Doctor Signup
1. Go to signup page
2. Select "I am a Doctor"
3. Verify you see ALL 10 specialties in the dropdown
4. Fill in all fields:
   - First Name, Last Name, Email, Password
   - Phone, Date of Birth, Gender
   - **Select a Specialty** from the dropdown
   - License Number
   - Years of Experience
   - Consultation Fee
   - Bio
5. Click "Sign Up"
6. Check database - ALL fields should be saved

### Test 2: Book Consultation Filter
1. Log in as a patient
2. Go to "Book Consultation" page
3. Check the "Specialty" filter dropdown
4. Verify you see ALL 10 cancer care specialties
5. Select a specialty and verify filtering works

### Test 3: Database Verification
Run this SQL to verify a new doctor was created properly:

```sql
SELECT 
    u.first_name,
    u.last_name,
    u.email,
    dp.specialization,
    dp.bio,
    dp.license_number,
    dp.experience,
    dp.consultation_fee,
    dp.rating
FROM users u
JOIN doctor_profiles dp ON u.id = dp.user_id
WHERE u.email = 'test-doctor@example.com';
```

All fields should have values (not NULL).

## Common Issues & Solutions

### Issue: "Only 4 specialties showing"
**Solution:** Clear browser cache and restart frontend:
```bash
# Windows
Ctrl + Shift + Delete (Clear cache)
# Or restart with cache clear
ng serve --delete-output-path
```

### Issue: "Specialty not saved to database"
**Solution:** Check if backend changes were applied:
```bash
cd chifaacare-backend
npm run build  # Rebuild backend
npm start      # Restart server
```

### Issue: "Database migration failed"
**Solution:** Reset and reapply migration:
```bash
cd chifaacare-backend
npx prisma migrate reset
npx prisma migrate deploy
npx prisma generate
```

## Files Modified

1. ✅ `src/app/components/auth/auth-page.component.ts`
2. ✅ `src/app/portals/patient/book-consultation/book-consultation.component.ts`
3. ✅ `chifaacare-backend/src/controllers/auth.controller.ts`
4. ✅ `chifaacare-backend/prisma/schema.prisma`

## Summary

All doctor signup issues are now fixed:
- ✅ All 10 specialties visible in signup form
- ✅ Specialty saves correctly to database
- ✅ All doctor fields (bio, license, experience, fee) now save properly
- ✅ Book consultation filter uses same specialties
- ✅ Database schema includes rating field

**Next Steps:** Update existing doctors' specialties in the database using the exact values provided above.
