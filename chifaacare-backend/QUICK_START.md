# 🚀 QUICK START - Fix Doctor Signup Now!

## ⚡ 3-Step Fix

### Step 1: Fix Database (Choose ONE command)
```bash
# Recommended: Push schema to database
npx prisma db push

# OR create a migration
npx prisma migrate dev --name fix_doctor_profile

# OR reset everything (⚠️ deletes data)
npx prisma migrate reset
```

### Step 2: Restart Server
```bash
npm run dev
```

### Step 3: Test It!
**Windows:** Double-click `test-doctor-signup.bat`
**Mac/Linux:** Run `bash test-doctor-signup.sh`

---

## ✅ What's Fixed?

1. **Database Error** - `rating` column now exists
2. **25 Medical Specializations** - Complete list available
3. **Validation** - Prevents invalid specializations
4. **New API Endpoint** - Get specializations list

---

## 🎯 Quick Test with Postman/Thunder Client

### Get Specializations
```
GET http://localhost:3000/api/v1/auth/specializations
```

### Signup as Doctor
```
POST http://localhost:3000/api/v1/auth/signup
Content-Type: application/json

{
  "email": "doctor@test.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "DOCTOR",
  "specialization": "Cardiology",
  "bio": "Experienced cardiologist",
  "licenseNumber": "MD123456",
  "experience": 10,
  "consultationFee": 150.00
}
```

---

## 📋 All 25 Specializations

1. Cardiology
2. Dermatology
3. Emergency Medicine
4. Endocrinology
5. Family Medicine
6. Gastroenterology
7. General Surgery
8. Gynecology
9. Internal Medicine
10. Neurology
11. Obstetrics
12. Oncology
13. Ophthalmology
14. Orthopedics
15. Otolaryngology (ENT)
16. Pediatrics
17. Physical Medicine and Rehabilitation
18. Psychiatry
19. Pulmonology
20. Radiology
21. Rheumatology
22. Urology
23. Anesthesiology
24. Nephrology
25. Pathology

---

## ❌ Common Issues

**Error: "rating column doesn't exist"**
→ Run: `npx prisma db push`

**Error: "Specialization required"**
→ Add specialization field to your request

**Error: "Invalid specialization"**
→ Use one from the list above

**Still not working?**
→ Run: `npx prisma migrate reset` (⚠️ deletes all data)

---

## 📚 Full Documentation

See `DOCTOR_SIGNUP_FIX.md` for complete details

---

## 🧪 Files Changed

- ✅ `src/controllers/auth.controller.ts` - Added specializations & validation
- ✅ `src/routes/auth.routes.ts` - Added new endpoint
- ✅ `src/constants/specializations.ts` - NEW file with specialization constants

**Total time to fix: 2 minutes** ⏱️
