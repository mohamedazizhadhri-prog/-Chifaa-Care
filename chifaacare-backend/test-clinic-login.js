const axios = require('axios');

async function testClinicLogin() {
  try {
    console.log('🔐 Testing clinic login...\n');
    
    const email = 'clinic@chifaacare.com';
    const password = 'Clinic123!';
    
    console.log('Attempting login with:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('URL: http://localhost:3000/api/v1/auth/login\n');
    
    const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: email,
      password: password
    });

    console.log('✅ Login successful!\n');
    console.log('='.repeat(50));
    console.log('RESPONSE DATA:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(response.data, null, 2));
    console.log('='.repeat(50));
    
    const user = response.data.data?.user;
    if (user) {
      console.log('\n📋 User Details:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Role Type:', typeof user.role);
      console.log('First Name:', user.firstName || 'N/A');
      console.log('Last Name:', user.lastName || 'N/A');
      
      console.log('\n🎯 Role Check:');
      if (user.role === 'CLINIC') {
        console.log('✅ Role is CORRECT! (CLINIC in uppercase)');
        console.log('✅ You should be redirected to /clinic/dashboard');
      } else {
        console.log('❌ Role is WRONG:', user.role);
        console.log('Expected: CLINIC');
        console.log('You will be redirected to:', getRoleRoute(user.role));
        console.log('\nFix this by running: node fix-clinic-role.js');
      }
    }
    
    if (response.data.token) {
      console.log('\n🎫 Token received:');
      console.log(response.data.token.substring(0, 50) + '...');
    }

  } catch (error) {
    console.log('\n❌ Login failed!\n');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n💡 Possible reasons:');
        console.log('1. User does not exist - Run: node create-clinic-user.js');
        console.log('2. Password is incorrect');
        console.log('3. Account is inactive');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Backend is not running!');
        console.log('Start it with: cd chifaacare-backend && npm start');
      }
    } else if (error.request) {
      console.log('❌ No response from server');
      console.log('\n💡 Backend might not be running!');
      console.log('Start it with: cd chifaacare-backend && npm start');
    } else {
      console.log('Error:', error.message);
    }
  }
}

function getRoleRoute(role) {
  const roleUpper = (role || '').toUpperCase();
  if (roleUpper === 'CLINIC') return '/clinic/dashboard';
  if (roleUpper === 'DOCTOR') return '/doctor/dashboard';
  if (roleUpper === 'ADMIN') return '/admin/dashboard';
  return '/patient/dashboard';
}

// Check if axios is installed
try {
  require.resolve('axios');
  testClinicLogin();
} catch (e) {
  console.log('❌ axios is not installed!');
  console.log('Install it with: npm install axios');
  console.log('Then run this script again');
}
