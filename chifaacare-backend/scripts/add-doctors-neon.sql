-- First, let's add the users
WITH new_users AS (
  INSERT INTO "User" (id, email, password, "firstName", "lastName", phone, role, "isEmailVerified", "isActive", "createdAt", "updatedAt")
  VALUES 
    (gen_random_uuid(), 'dr.nadia.masmoudi@tunisiacare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nadia', 'Masmoudi', '+21650123456', 'DOCTOR', true, true, NOW(), NOW()),
    (gen_random_uuid(), 'dr.karim.benammar@tunisiacare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Karim', 'Ben Ammar', '+21650123457', 'DOCTOR', true, true, NOW(), NOW()),
    (gen_random_uuid(), 'dr.leila.gharbi@tunisiacare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Leila', 'Gharbi', '+21650123458', 'DOCTOR', true, true, NOW(), NOW())
  RETURNING id, email, "firstName", "lastName"
)

-- Then add their doctor profiles
INSERT INTO "DoctorProfile" (id, "userId", specialization, bio, "licenseNumber", experience, "consultationFee", "availableDays", "availableHours", languages, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  nu.id,
  CASE 
    WHEN nu."lastName" = 'Masmoudi' THEN 'Dermatology'
    WHEN nu."lastName" = 'Ben Ammar' THEN 'Neurology'
    WHEN nu."lastName" = 'Gharbi' THEN 'Gynecology'
  END,
  CASE 
    WHEN nu."lastName" = 'Masmoudi' THEN 'Dermatologist with extensive experience in treating skin conditions and cosmetic dermatology. Fluent in Arabic and French.'
    WHEN nu."lastName" = 'Ben Ammar' THEN 'Neurologist specialized in treating disorders of the nervous system. Experienced in both clinical and research settings.'
    WHEN nu."lastName" = 'Gharbi' THEN 'Gynecologist providing comprehensive women''s health services with a focus on preventive care and patient education.'
  END,
  'TN-' || floor(random() * 900000 + 100000)::text,
  CASE 
    WHEN nu."lastName" = 'Masmoudi' THEN 9
    WHEN nu."lastName" = 'Ben Ammar' THEN 11
    WHEN nu."lastName" = 'Gharbi' THEN 7
  END,
  CASE 
    WHEN nu."lastName" = 'Masmoudi' THEN 90.0
    WHEN nu."lastName" = 'Ben Ammar' THEN 110.0
    WHEN nu."lastName" = 'Gharbi' THEN 85.0
  END,
  '["Monday", "Tuesday", "Thursday"]',
  '["08:00-12:00", "14:00-18:00"]',
  '["Arabic", "French"]',
  NOW(),
  NOW()
FROM new_users nu
WHERE NOT EXISTS (
  SELECT 1 FROM "DoctorProfile" dp 
  JOIN "User" u ON dp."userId" = u.id 
  WHERE u.email = nu.email
);

-- Add education for each doctor
INSERT INTO "Education" (id, "doctorProfileId", degree, institution, "fieldOfStudy", "startYear", "endYear", description, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  dp.id,
  CASE 
    WHEN u."lastName" = 'Ben Ammar' THEN 'MD, PhD'
    ELSE 'MD'
  END,
  CASE 
    WHEN u."lastName" = 'Masmoudi' THEN 'Faculty of Medicine of Tunis'
    WHEN u."lastName" = 'Ben Ammar' THEN 'Faculty of Medicine of Sfax'
    WHEN u."lastName" = 'Gharbi' THEN 'Faculty of Medicine of Monastir'
  END,
  dp.specialization,
  EXTRACT(YEAR FROM NOW()) - dp.experience - 5,
  EXTRACT(YEAR FROM NOW()) - dp.experience,
  'Graduated from ' || 
  CASE 
    WHEN u."lastName" = 'Masmoudi' THEN 'Faculty of Medicine of Tunis'
    WHEN u."lastName" = 'Ben Ammar' THEN 'Faculty of Medicine of Sfax'
    WHEN u."lastName" = 'Gharbi' THEN 'Faculty of Medicine of Monastir'
  END || ' with specialization in ' || dp.specialization,
  NOW(),
  NOW()
FROM "DoctorProfile" dp
JOIN "User" u ON dp."userId" = u.id
WHERE u.email IN (
  'dr.nadia.masmoudi@tunisiacare.com',
  'dr.karim.benammar@tunisiacare.com',
  'dr.leila.gharbi@tunisiacare.com'
)
AND NOT EXISTS (
  SELECT 1 FROM "Education" e 
  WHERE e."doctorProfileId" = dp.id
);

-- Show the added doctors
SELECT 
  u.id,
  u.email,
  u."firstName" || ' ' || u."lastName" as name,
  dp.specialization,
  dp."consultationFee",
  u.phone,
  'Tunisia@2023' as password
FROM "User" u
JOIN "DoctorProfile" dp ON u.id = dp."userId"
WHERE u.email IN (
  'dr.nadia.masmoudi@tunisiacare.com',
  'dr.karim.benammar@tunisiacare.com',
  'dr.leila.gharbi@tunisiacare.com'
);
