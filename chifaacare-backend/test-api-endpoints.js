const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000/api/v1';

async function testEndpoints() {
  console.log('🔍 Testing API Endpoints...\n');
  console.log('Base URL:', BASE_URL);
  console.log('====================================\n');

  // Test 1: Health Check
  console.log('1️⃣  Testing Health Check...');
  try {
    const response = await axios.get('http://localhost:3000/api/health');
    console.log('✅ Health Check:', response.data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
  console.log('');

  // Test 2: Get All Doctors (no auth required)
  console.log('2️⃣  Testing GET /doctors (Public)...');
  try {
    const response = await axios.get(`${BASE_URL}/doctors`);
    console.log('✅ Status:', response.status);
    console.log('📊 Response Structure:', {
      status: response.data.status,
      results: response.data.results,
      doctorsCount: response.data.data?.doctors?.length || 0
    });
    
    if (response.data.data?.doctors?.length > 0) {
      console.log('👨‍⚕️  First Doctor Sample:');
      const firstDoctor = response.data.data.doctors[0];
      console.log({
        id: firstDoctor.id,
        name: `${firstDoctor.firstName} ${firstDoctor.lastName}`,
        email: firstDoctor.email,
        role: firstDoctor.role,
        specialization: firstDoctor.doctorProfile?.specialization || 'N/A'
      });
    } else {
      console.log('⚠️  No doctors found in response!');
    }
  } catch (error) {
    console.log('❌ Failed:', error.response?.status, error.response?.data || error.message);
  }
  console.log('');

  // Test 3: Get All Patients (requires auth)
  console.log('3️⃣  Testing GET /patients (Requires Auth)...');
  try {
    const response = await axios.get(`${BASE_URL}/patients`);
    console.log('✅ Status:', response.status);
    console.log('📊 Patients Count:', response.data.results || 0);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('🔐 Expected: Requires Authentication (401)');
    } else {
      console.log('❌ Failed:', error.response?.status, error.response?.data || error.message);
    }
  }
  console.log('');

  // Test 4: Login with test account
  console.log('4️⃣  Testing Login...');
  let token = null;
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'patient@chifaacare.com',
      password: 'patient123'
    });
    
    token = loginResponse.data.token;
    console.log('✅ Login Successful');
    console.log('🎫 Token received:', token ? 'Yes' : 'No');
    console.log('👤 User:', {
      id: loginResponse.data.user?.id,
      name: `${loginResponse.data.user?.firstName} ${loginResponse.data.user?.lastName}`,
      role: loginResponse.data.user?.role
    });
  } catch (error) {
    console.log('❌ Login Failed:', error.response?.data?.message || error.message);
    console.log('💡 Make sure to create test account first: node create-test-accounts.js');
  }
  console.log('');

  // Test 5: Get Patients with Auth
  if (token) {
    console.log('5️⃣  Testing GET /patients (With Auth Token)...');
    try {
      const response = await axios.get(`${BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Status:', response.status);
      console.log('📊 Patients Count:', response.data.results || 0);
      
      if (response.data.data?.patients?.length > 0) {
        console.log('🏥 First Patient Sample:');
        const firstPatient = response.data.data.patients[0];
        console.log({
          id: firstPatient.id,
          name: `${firstPatient.firstName} ${firstPatient.lastName}`,
          email: firstPatient.email,
          role: firstPatient.role
        });
      }
    } catch (error) {
      console.log('❌ Failed:', error.response?.status, error.response?.data || error.message);
    }
    console.log('');
  }

  console.log('====================================');
  console.log('✅ Test Complete\n');
  
  console.log('💡 Next Steps:');
  console.log('1. If doctors are empty, run: npm run seed:safe');
  console.log('2. Check browser console for CORS errors');
  console.log('3. Verify frontend environment.ts has correct apiUrl');
  console.log('4. Make sure both frontend and backend are running');
}

// Run the tests
testEndpoints().catch(console.error);
