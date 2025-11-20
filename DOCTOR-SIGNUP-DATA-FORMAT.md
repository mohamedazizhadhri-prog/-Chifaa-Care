# Doctor Sign-Up Data Format

## ✅ CORRECT Format (What Frontend Now Sends)

```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+216-12345678",
  "dateOfBirth": "1980-05-15",
  "gender": "MALE",
  "role": "DOCTOR",
  "doctorProfile": {
    "specialization": "Medical Oncologist",
    "bio": "Experienced oncologist with focus on cancer treatment",
    "licenseNumber": "MD12345",
    "experience": 10,
    "consultationFee": 150
  }
}
```

## Backend Now Accepts BOTH Formats

### Format 1: Nested (Preferred)
```json
{
  "role": "DOCTOR",
  "doctorProfile": {
    "specialization": "Cardiology",
    "experience": 5
  }
}
```

### Format 2: Flat (Also Works)
```json
{
  "role": "DOCTOR",
  "specialization": "Cardiology",
  "experience": 5
}
```

## Specialty Name Rules

### ✅ CORRECT Names (Must Use These)
```
Medical Oncologist          ✓ Correct
Surgical Oncologist         ✓ Correct
Hematologist-Oncologist     ✓ Correct (note the hyphen)
Cardiology                  ✓ Correct
Otolaryngology (ENT)        ✓ Correct (note the parentheses)
```

### ❌ WRONG Names (Will Fail)
```
Medical Oncology            ✗ Wrong (missing -ist)
Surgical Oncology           ✗ Wrong (missing -ist)
Hematologist Oncologist     ✗ Wrong (missing hyphen)
Cardiology Doctor           ✗ Wrong (extra word)
ENT                         ✗ Wrong (must use full name)
```

## Example Sign-Up Requests

### Cancer Specialist
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "oncologist@test.com",
    "password": "Test123!",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "phone": "+216-98765432",
    "dateOfBirth": "1982-03-20",
    "gender": "FEMALE",
    "role": "DOCTOR",
    "doctorProfile": {
      "specialization": "Breast Oncologist",
      "licenseNumber": "MD-BC-2024",
      "experience": 8,
      "consultationFee": 200,
      "bio": "Specialized in breast cancer treatment and research"
    }
  }'
```

### General Practitioner
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "familydoc@test.com",
    "password": "Test123!",
    "firstName": "Michael",
    "lastName": "Chen",
    "phone": "+216-11223344",
    "dateOfBirth": "1978-11-10",
    "gender": "MALE",
    "role": "DOCTOR",
    "doctorProfile": {
      "specialization": "Family Medicine",
      "licenseNumber": "MD-FM-2024",
      "experience": 15,
      "consultationFee": 80,
      "bio": "Providing comprehensive family healthcare"
    }
  }'
```

### Pediatrician
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pediatrician@test.com",
    "password": "Test123!",
    "firstName": "Emily",
    "lastName": "Rodriguez",
    "phone": "+216-55667788",
    "dateOfBirth": "1985-07-25",
    "gender": "FEMALE",
    "role": "DOCTOR",
    "doctorProfile": {
      "specialization": "Pediatrics",
      "licenseNumber": "MD-PED-2024",
      "experience": 6,
      "consultationFee": 90,
      "bio": "Caring for children and adolescents"
    }
  }'
```

## Patient Sign-Up Format (For Reference)

```json
{
  "email": "patient@example.com",
  "password": "PatientPass123!",
  "firstName": "Alice",
  "lastName": "Williams",
  "phone": "+216-99887766",
  "dateOfBirth": "1990-08-12",
  "gender": "FEMALE",
  "role": "PATIENT",
  "patientProfile": {
    "bloodType": "A+",
    "height": 165,
    "weight": 60
  }
}
```

## Validation Rules

### Required Fields (All Users)
- ✓ email (unique, valid email format)
- ✓ password (min 6 characters)
- ✓ firstName
- ✓ lastName
- ✓ phone
- ✓ role (PATIENT, DOCTOR, CLINIC, ADMIN)

### Required Fields (Doctor Only)
- ✓ specialization (must match one of 35 approved specialties)
- ✓ licenseNumber (any string)
- ✓ experience (number >= 0)
- ✓ consultationFee (number >= 0)

### Optional Fields (Doctor)
- bio (string, defaults to empty)

### Optional Fields (Patient)
- bloodType (A+, A-, B+, B-, AB+, AB-, O+, O-)
- height (number in cm)
- weight (number in kg)

## Success Response

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "doctor@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "DOCTOR"
    }
  }
}
```

## Error Responses

### Invalid Specialization
```json
{
  "message": "Invalid specialization. Please choose from the available specializations.",
  "providedSpecialization": "Medical Oncology",
  "availableSpecializations": [
    "Medical Oncologist",
    "Surgical Oncologist",
    ...
  ]
}
```

### Missing Specialization
```json
{
  "message": "Specialization is required for doctor registration",
  "availableSpecializations": [...]
}
```

### Email Already Exists
```json
{
  "message": "User already exists with this email"
}
```

## Complete List of Valid Specializations

Copy-paste ready for testing:

```javascript
const VALID_SPECIALTIES = [
  // Cancer Care (10)
  'Medical Oncologist',
  'Surgical Oncologist',
  'Radiation Oncologist',
  'Hematologist-Oncologist',
  'Breast Oncologist',
  'Gynecologic Oncologist',
  'Urologic Oncologist',
  'Gastrointestinal Oncologist',
  'Thoracic Oncologist',
  'Pediatric Oncologist',
  
  // General Medicine (25)
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Surgery',
  'Gynecology',
  'Internal Medicine',
  'Neurology',
  'Obstetrics',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology (ENT)',
  'Pediatrics',
  'Physical Medicine and Rehabilitation',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Urology',
  'Anesthesiology',
  'Nephrology',
  'Pathology'
];
```

---

## Testing Checklist

- [ ] Test sign-up with Cancer specialty (e.g., Medical Oncologist)
- [ ] Test sign-up with General specialty (e.g., Cardiology)
- [ ] Test sign-up with hyphenated specialty (e.g., Hematologist-Oncologist)
- [ ] Test sign-up with parentheses specialty (e.g., Otolaryngology (ENT))
- [ ] Verify doctor appears in database
- [ ] Verify doctor shows in Book Consultation filter
- [ ] Test booking appointment with new doctor
- [ ] Test invalid specialty is rejected
- [ ] Test duplicate email is rejected

---

**Reference**: See `chifaacare-backend/src/constants/specializations.ts` for the authoritative list.
