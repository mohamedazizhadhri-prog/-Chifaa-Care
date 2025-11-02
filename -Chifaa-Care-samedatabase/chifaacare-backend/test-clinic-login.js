const axios = require('axios');

async function testClinicLogin() {
  try {
    console.log('🏥 Testing clinic login...');
    
    const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'clinic@chifaacare.com',
      password: 'clinic123'
    });
    
    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('User Role:', response.data.user?.role);
    console.log('Token:', response.data.token ? 'Present' : 'Missing');
    
    if (response.data.user?.role === 'CLINIC') {
      console.log('🎉 Clinic dashboard access confirmed!');
    }
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
  }
}

testClinicLogin();
