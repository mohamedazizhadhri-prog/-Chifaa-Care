@echo off
echo ======================================
echo Testing Appointment Workflow
echo ======================================
echo.

set BACKEND_URL=http://localhost:3000/api/v1

echo Prerequisites:
echo - Backend must be running (npm run dev)
echo - You must have a doctor account
echo - You must have a patient account
echo.
pause

echo.
echo [1] Patient creates appointment...
curl -X POST %BACKEND_URL%/appointments ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" ^
  -d "{\"doctorId\":\"DOCTOR_ID\",\"appointmentDate\":\"2025-11-10T10:00:00Z\",\"endTime\":\"2025-11-10T11:00:00Z\",\"reason\":\"Test consultation\"}"

echo.
echo.
echo [2] Patient initiates payment...
echo (Use Stripe test card: 4242 4242 4242 4242)
echo Visit: http://localhost:4200/patient/appointments
echo.
pause

echo.
echo [3] Doctor views pending appointments...
curl -X GET %BACKEND_URL%/appointments/doctor/pending ^
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"

echo.
echo.
echo [4] Doctor accepts appointment...
set /p APPOINTMENT_ID="Enter Appointment ID: "
curl -X POST %BACKEND_URL%/appointments/%APPOINTMENT_ID%/accept ^
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"

echo.
echo.
echo [5] Check if calendar event created...
curl -X GET %BACKEND_URL%/calendar/events ^
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"

echo.
echo.
echo ======================================
echo Test Complete!
echo ======================================
echo Check:
echo - Appointment status changed to CONFIRMED
echo - Event appears in Google Calendar
echo - Patient received confirmation
echo.
pause
