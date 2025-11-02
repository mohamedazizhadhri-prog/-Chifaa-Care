const axios = require('axios');

async function verifyClinicLogin() {
  const accounts = [
    'testclinic@chifaacare.com',
    'clinic@chifaacare.com',
    'admin222@chifaacare.com'
  ];
  
  console.log('🔍 Verifying clinic account logins...\n');
  
  for (const email of accounts) {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
        email: email,
        password: 'clinic123'
      });
      
      console.log(`✅ ${email}`);
      console.log(`   Role: ${response.data.user?.role || 'N/A'}`);
      console.log(`   Token: ${response.data.token ? '✓ Present' : '✗ Missing'}`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${email}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      console.log('');
    }
  }
}

verifyClinicLogin();
