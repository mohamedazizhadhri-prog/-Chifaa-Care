#!/bin/bash

# Test Script for Doctor Signup Fix
# Run this after applying the fixes

echo "🧪 Testing Doctor Signup Fixes..."
echo ""

BASE_URL="http://localhost:3000/api/v1/auth"

# Test 1: Get Specializations
echo "📋 Test 1: Fetching available specializations..."
curl -s -X GET "$BASE_URL/specializations" | jq '.'
echo ""
echo "---"
echo ""

# Test 2: Doctor Signup with Valid Specialization
echo "✅ Test 2: Doctor signup with VALID specialization (Cardiology)..."
curl -s -X POST "$BASE_URL/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.doctor@chifaacare.com",
    "password": "SecurePass123!",
    "firstName": "Ahmed",
    "lastName": "Benali",
    "phone": "+21612345678",
    "role": "DOCTOR",
    "specialization": "Cardiology",
    "bio": "Board-certified cardiologist with 10 years of experience",
    "licenseNumber": "TN-MD-12345",
    "experience": 10,
    "consultationFee": 150.00
  }' | jq '.'
echo ""
echo "---"
echo ""

# Test 3: Doctor Signup with Invalid Specialization
echo "❌ Test 3: Doctor signup with INVALID specialization (should fail)..."
curl -s -X POST "$BASE_URL/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.doctor2@chifaacare.com",
    "password": "SecurePass123!",
    "firstName": "Fatima",
    "lastName": "Trabelsi",
    "phone": "+21698765432",
    "role": "DOCTOR",
    "specialization": "InvalidSpecialty"
  }' | jq '.'
echo ""
echo "---"
echo ""

# Test 4: Doctor Signup without Specialization
echo "❌ Test 4: Doctor signup WITHOUT specialization (should fail)..."
curl -s -X POST "$BASE_URL/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.doctor3@chifaacare.com",
    "password": "SecurePass123!",
    "firstName": "Mohamed",
    "lastName": "Karoui",
    "phone": "+21655555555",
    "role": "DOCTOR"
  }' | jq '.'
echo ""
echo "---"
echo ""

# Test 5: Patient Signup (should still work)
echo "👤 Test 5: Patient signup (no specialization needed)..."
curl -s -X POST "$BASE_URL/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.patient@chifaacare.com",
    "password": "SecurePass123!",
    "firstName": "Leila",
    "lastName": "Mansour",
    "phone": "+21677777777",
    "role": "PATIENT",
    "bloodType": "O+",
    "height": 165,
    "weight": 60
  }' | jq '.'
echo ""
echo "---"
echo ""

echo "✅ Testing complete!"
echo ""
echo "Expected Results:"
echo "- Test 1: Should return list of 25 specializations"
echo "- Test 2: Should succeed and return user + token"
echo "- Test 3: Should fail with 400 error + list of valid specializations"
echo "- Test 4: Should fail with 400 error + message that specialization is required"
echo "- Test 5: Should succeed (patients don't need specialization)"
