# Doctor Signup Fix - Complete Guide

## Issues Fixed

### 1. Database Schema Mismatch
**Problem**: The `rating` column doesn't exist in the database's `DoctorProfile` table.

**Solution**: Run database migration to sync the schema.

### 2. Missing Medical Specializations
**Problem**: No list of medical specializations to choose from.

**Solution**: Added 25 medical specializations with validation.

---

## Step-by-Step Fix Instructions

### Step 1: Fix Database Schema

Run **ONE** of these commands in your terminal:

```bash
# Option A: Recommended - Generate Prisma client and push changes
npx prisma generate
npx prisma db push

# Option B: Create a migration (better for production)
npx prisma generate
npx prisma migrate dev --name add_missing_doctor_fields

# Option C: If nothing works, reset database (⚠️ DELETES ALL DATA!)
npx prisma migrate reset
```

### Step 2: Restart Your Server

```bash
npm run dev
```

---

## New Features Added

### 1. Medical Specializations List (25 Specialties)

The following specializations are now available:

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

### 2. New API Endpoint

**GET /api/v1/auth/specializations**

Retrieve the list of available medical specializations.

**Example Request:**
```bash
curl http://localhost:3000/api/v1/auth/specializations
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "specializations": [
      "Cardiology",
      "Dermatology",
      "Emergency Medicine",
      ...
    ]
  }
}
```

### 3. Enhanced Doctor Signup

**POST /api/v1/auth/signup**

**Required Fields for Doctor:**
```json
{
  "email": "doctor@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "DOCTOR",
  "specialization": "Cardiology",  // ✅ REQUIRED - Must be from the list
  "bio": "Experienced cardiologist...",
  "licenseNumber": "MD123456",
  "experience": 10,
  "consultationFee": 150.00
}
```

**Validation:**
- `specialization` is **required** for doctors
- `specialization` must be one of the 25 available specializations
- If invalid, the API will return the list of valid specializations

**Example Error Response (Invalid Specialization):**
```json
{
  "message": "Invalid specialization. Please choose from the available specializations.",
  "availableSpecializations": [
    "Cardiology",
    "Dermatology",
    ...
  ]
}
```

---

## Frontend Integration Example

### Fetching Specializations (React/Vue/Angular)

```javascript
// Fetch available specializations
const fetchSpecializations = async () => {
  const response = await fetch('http://localhost:3000/api/v1/auth/specializations');
  const data = await response.json();
  return data.data.specializations;
};

// Use in a dropdown/select
const SpecializationDropdown = () => {
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    fetchSpecializations().then(setSpecializations);
  }, []);

  return (
    <select name="specialization" required>
      <option value="">Select Specialization</option>
      {specializations.map(spec => (
        <option key={spec} value={spec}>{spec}</option>
      ))}
    </select>
  );
};
```

### Doctor Signup Example

```javascript
const signupDoctor = async (formData) => {
  const response = await fetch('http://localhost:3000/api/v1/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      role: 'DOCTOR',
      specialization: formData.specialization, // From dropdown
      bio: formData.bio,
      licenseNumber: formData.licenseNumber,
      experience: formData.experience,
      consultationFee: formData.consultationFee,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    // Handle error - may include list of valid specializations
    console.error(data.message);
    if (data.availableSpecializations) {
      console.log('Valid specializations:', data.availableSpecializations);
    }
    throw new Error(data.message);
  }

  return data;
};
```

---

## Testing

### Test 1: Get Specializations
```bash
curl http://localhost:3000/api/v1/auth/specializations
```

### Test 2: Doctor Signup (Success)
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@test.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567890",
    "role": "DOCTOR",
    "specialization": "Cardiology",
    "bio": "Board-certified cardiologist",
    "licenseNumber": "MD123456",
    "experience": 8,
    "consultationFee": 200.00
  }'
```

### Test 3: Doctor Signup (Invalid Specialization)
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor2@test.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DOCTOR",
    "specialization": "InvalidSpecialty"
  }'
```

Expected: Error with list of valid specializations

### Test 4: Doctor Signup (Missing Specialization)
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor3@test.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DOCTOR"
  }'
```

Expected: Error indicating specialization is required

---

## Troubleshooting

### Error: "The column `rating` does not exist"

**Solution:**
```bash
npx prisma generate
npx prisma db push
```

### Error: "Specialization is required"

**Solution:** Include a valid specialization in the signup request.

### Error: "Invalid specialization"

**Solution:** Use one of the 25 specializations from the list. Fetch them from:
```
GET /api/v1/auth/specializations
```

### Database is out of sync

**Solution:**
```bash
# Careful: This deletes all data
npx prisma migrate reset

# Then restart server
npm run dev
```

---

## Summary of Changes

### Files Modified:
1. ✅ `src/controllers/auth.controller.ts` - Added specializations list and validation
2. ✅ `src/routes/auth.routes.ts` - Added specializations endpoint

### New Features:
1. ✅ 25 Medical specializations
2. ✅ Specialization validation on doctor signup
3. ✅ Public API endpoint to fetch specializations
4. ✅ Better error messages with helpful suggestions
5. ✅ Automatic cleanup if profile creation fails

### Bug Fixes:
1. ✅ Fixed database schema mismatch for `rating` column
2. ✅ Added explicit `rating: 0.0` in doctor profile creation
3. ✅ Added validation to prevent doctors signing up without specialization

---

## Need Help?

If you continue to have issues:

1. Check the server logs for detailed error messages
2. Verify your database connection in `.env`
3. Ensure all Prisma migrations are applied
4. Clear `node_modules` and reinstall: `npm install`
5. Regenerate Prisma client: `npx prisma generate`
