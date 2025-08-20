const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1/auth';

async function testAuth() {
  try {
    console.log('🚀 Testing authentication flow...');
    
    // Test data
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
      role: 'PATIENT'
    };

    // 1. Test Signup
    console.log('\n🔐 Testing signup...');
    const signupResponse = await axios.post(`${API_BASE_URL}/signup`, testUser);
    console.log('✅ Signup successful!');
    console.log('Response:', {
      status: signupResponse.status,
      data: signupResponse.data
    });

    // 2. Test Login with correct credentials
    console.log('\n🔑 Testing login with correct credentials...');
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', loginResponse.data.token);
    console.log('User data:', loginResponse.data.data.user);

    // 3. Test Login with incorrect password
    try {
      console.log('\n🔒 Testing login with incorrect password...');
      await axios.post(`${API_BASE_URL}/login`, {
        email: testUser.email,
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('✅ Correctly received error for invalid password');
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed!');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAuth();
