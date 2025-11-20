@echo off
REM Test Script for Doctor Signup Fix (Windows)
REM Run this after applying the fixes

echo Testing Doctor Signup Fixes...
echo.

set BASE_URL=http://localhost:3000/api/v1/auth

echo Test 1: Fetching available specializations...
curl -X GET "%BASE_URL%/specializations"
echo.
echo ---
echo.

echo Test 2: Doctor signup with VALID specialization (Cardiology)...
curl -X POST "%BASE_URL%/signup" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test.doctor@chifaacare.com\",\"password\":\"SecurePass123!\",\"firstName\":\"Ahmed\",\"lastName\":\"Benali\",\"phone\":\"+21612345678\",\"role\":\"DOCTOR\",\"specialization\":\"Cardiology\",\"bio\":\"Board-certified cardiologist\",\"licenseNumber\":\"TN-MD-12345\",\"experience\":10,\"consultationFee\":150.00}"
echo.
echo ---
echo.

echo Test 3: Doctor signup with INVALID specialization (should fail)...
curl -X POST "%BASE_URL%/signup" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test.doctor2@chifaacare.com\",\"password\":\"SecurePass123!\",\"firstName\":\"Fatima\",\"lastName\":\"Trabelsi\",\"role\":\"DOCTOR\",\"specialization\":\"InvalidSpecialty\"}"
echo.
echo ---
echo.

echo Test 4: Doctor signup WITHOUT specialization (should fail)...
curl -X POST "%BASE_URL%/signup" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test.doctor3@chifaacare.com\",\"password\":\"SecurePass123!\",\"firstName\":\"Mohamed\",\"lastName\":\"Karoui\",\"role\":\"DOCTOR\"}"
echo.
echo ---
echo.

echo Test 5: Patient signup (no specialization needed)...
curl -X POST "%BASE_URL%/signup" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test.patient@chifaacare.com\",\"password\":\"SecurePass123!\",\"firstName\":\"Leila\",\"lastName\":\"Mansour\",\"role\":\"PATIENT\",\"bloodType\":\"O+\",\"height\":165,\"weight\":60}"
echo.
echo ---
echo.

echo.
echo Testing complete!
echo.
echo Expected Results:
echo - Test 1: Should return list of 25 specializations
echo - Test 2: Should succeed and return user + token
echo - Test 3: Should fail with 400 error + list of valid specializations
echo - Test 4: Should fail with 400 error + message that specialization is required
echo - Test 5: Should succeed (patients don't need specialization)

pause
