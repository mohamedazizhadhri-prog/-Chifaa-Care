@echo off
echo ============================================
echo   TESTING DOCTOR SIGN-UP WITH SPECIALTY
echo ============================================
echo.
echo This script will test doctor sign-up with a valid specialty
echo.

REM Test data
set EMAIL=test-doctor-%RANDOM%@example.com
set FIRSTNAME=Dr.
set LASTNAME=TestDoctor
set PASSWORD=Test123!
set PHONE=+216-1234-5678
set DOB=1985-05-15
set GENDER=MALE
set SPECIALTY=Medical Oncologist
set LICENSE=MD-%RANDOM%
set EXPERIENCE=10
set FEE=150

echo Testing doctor sign-up with:
echo Email: %EMAIL%
echo Specialty: %SPECIALTY%
echo.
echo Sending request to backend...
echo.

REM Make the API call
curl -X POST http://localhost:3000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\",\"firstName\":\"%FIRSTNAME%\",\"lastName\":\"%LASTNAME%\",\"phone\":\"%PHONE%\",\"dateOfBirth\":\"%DOB%\",\"gender\":\"%GENDER%\",\"role\":\"DOCTOR\",\"doctorProfile\":{\"specialization\":\"%SPECIALTY%\",\"licenseNumber\":\"%LICENSE%\",\"experience\":%EXPERIENCE%,\"consultationFee\":%FEE%,\"bio\":\"Test oncologist\"}}" ^
  -w "\n\nHTTP Status: %%{http_code}\n"

echo.
echo ============================================
echo   TEST COMPLETE
echo ============================================
echo.
echo If you see HTTP Status: 201, the test PASSED!
echo If you see HTTP Status: 400, check the error message
echo.
pause
