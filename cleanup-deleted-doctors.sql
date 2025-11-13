-- SQL Script to Manage Deleted/Inactive Doctors
-- Run this in your PostgreSQL database if you need to clean up data

-- ============================================
-- 1. VIEW ALL DOCTORS AND THEIR STATUS
-- ============================================
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  role,
  "isActive",
  "createdAt",
  "updatedAt"
FROM "User"
WHERE role = 'DOCTOR'
ORDER BY "isActive" DESC, "lastName" ASC;


-- ============================================
-- 2. COUNT ACTIVE VS INACTIVE DOCTORS
-- ============================================
SELECT 
  "isActive",
  COUNT(*) as count
FROM "User"
WHERE role = 'DOCTOR'
GROUP BY "isActive";


-- ============================================
-- 3. VIEW CONVERSATIONS WITH DELETED DOCTORS
-- ============================================
SELECT 
  m.id as message_id,
  m."senderId",
  m."recipientId",
  m.content,
  m."createdAt",
  sender.email as sender_email,
  sender."isActive" as sender_active,
  recipient.email as recipient_email,
  recipient."isActive" as recipient_active
FROM "Message" m
LEFT JOIN "User" sender ON m."senderId" = sender.id
LEFT JOIN "User" recipient ON m."recipientId" = recipient.id
WHERE sender."isActive" = false OR recipient."isActive" = false
ORDER BY m."createdAt" DESC
LIMIT 100;


-- ============================================
-- 4. DEACTIVATE A SPECIFIC DOCTOR (SOFT DELETE)
-- ============================================
-- Replace 'doctor@example.com' with the actual email
UPDATE "User"
SET "isActive" = false,
    "updatedAt" = NOW()
WHERE email = 'doctor@example.com' 
  AND role = 'DOCTOR';


-- ============================================
-- 5. REACTIVATE A DOCTOR
-- ============================================
-- Replace 'doctor@example.com' with the actual email
UPDATE "User"
SET "isActive" = true,
    "updatedAt" = NOW()
WHERE email = 'doctor@example.com' 
  AND role = 'DOCTOR';


-- ============================================
-- 6. BULK DEACTIVATE DOCTORS WITHOUT PROFILE
-- ============================================
-- Deactivate doctors who don't have a doctor profile
UPDATE "User" u
SET "isActive" = false,
    "updatedAt" = NOW()
WHERE u.role = 'DOCTOR'
  AND u."isActive" = true
  AND NOT EXISTS (
    SELECT 1 FROM "DoctorProfile" dp 
    WHERE dp."userId" = u.id
  );


-- ============================================
-- 7. VIEW DOCTORS WITHOUT PROFILES
-- ============================================
SELECT 
  u.id,
  u.email,
  u."firstName",
  u."lastName",
  u."isActive",
  CASE 
    WHEN dp.id IS NULL THEN 'No Profile'
    ELSE 'Has Profile'
  END as profile_status
FROM "User" u
LEFT JOIN "DoctorProfile" dp ON u.id = dp."userId"
WHERE u.role = 'DOCTOR'
ORDER BY profile_status, u."lastName";


-- ============================================
-- 8. DELETE OLD MESSAGES WITH INACTIVE USERS (OPTIONAL)
-- ============================================
-- WARNING: This permanently deletes messages
-- Only run if you want to clean up old data
/*
DELETE FROM "Message"
WHERE "senderId" IN (
  SELECT id FROM "User" WHERE "isActive" = false
)
OR "recipientId" IN (
  SELECT id FROM "User" WHERE "isActive" = false
);
*/


-- ============================================
-- 9. VIEW INACTIVE DOCTORS WITH MESSAGE COUNT
-- ============================================
SELECT 
  u.id,
  u.email,
  u."firstName",
  u."lastName",
  u."isActive",
  COUNT(DISTINCT m.id) as total_messages,
  MAX(m."createdAt") as last_message_date
FROM "User" u
LEFT JOIN "Message" m ON (u.id = m."senderId" OR u.id = m."recipientId")
WHERE u.role = 'DOCTOR' AND u."isActive" = false
GROUP BY u.id, u.email, u."firstName", u."lastName", u."isActive"
ORDER BY total_messages DESC;


-- ============================================
-- 10. PERMANENTLY DELETE A DOCTOR (HARD DELETE)
-- ============================================
-- WARNING: This is permanent and will cascade delete!
-- Only use if you're absolutely sure
/*
-- First, delete related data
DELETE FROM "Message" WHERE "senderId" = 'doctor-uuid-here' OR "recipientId" = 'doctor-uuid-here';
DELETE FROM "Appointment" WHERE "doctorId" = 'doctor-uuid-here';
DELETE FROM "TreatmentPlan" WHERE "doctorId" = 'doctor-uuid-here';
DELETE FROM "TreatmentNote" WHERE "doctorId" = 'doctor-uuid-here';
DELETE FROM "Education" WHERE "doctorProfileId" IN (SELECT id FROM "DoctorProfile" WHERE "userId" = 'doctor-uuid-here');
DELETE FROM "DoctorProfile" WHERE "userId" = 'doctor-uuid-here';

-- Finally, delete the user
DELETE FROM "User" WHERE id = 'doctor-uuid-here' AND role = 'DOCTOR';
*/


-- ============================================
-- 11. VERIFY CLEANUP - Check Active Doctors Only
-- ============================================
SELECT 
  COUNT(*) as active_doctors
FROM "User"
WHERE role = 'DOCTOR' AND "isActive" = true;


-- ============================================
-- 12. FIND ORPHANED DOCTOR PROFILES
-- ============================================
-- Doctor profiles where the user no longer exists or is inactive
SELECT 
  dp.id as profile_id,
  dp."userId",
  u.email,
  u."isActive",
  dp.specialization
FROM "DoctorProfile" dp
LEFT JOIN "User" u ON dp."userId" = u.id
WHERE u.id IS NULL OR u."isActive" = false OR u.role != 'DOCTOR';


-- ============================================
-- RECOMMENDED USAGE
-- ============================================

-- SOFT DELETE (Recommended - keeps data for history):
-- UPDATE "User" SET "isActive" = false WHERE email = 'doctor@example.com';

-- HARD DELETE (Not recommended - permanent):
-- Use only if GDPR requires complete data removal

-- The application now automatically filters:
-- ✓ Backend: WHERE isActive = true
-- ✓ Frontend: Additional filtering for safety
-- ✓ Auto-refresh: Updates every 5 seconds
-- ✓ Message validation: Cannot message inactive users

