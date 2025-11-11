// Quick diagnostic script to check what's happening
console.log('🔍 ChifaaCare Diagnostic Check\n');
console.log('================================\n');

// Check 1: Authentication
console.log('1️⃣  Authentication Status:');
const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
const user = localStorage.getItem('current_user');

if (token) {
  console.log('✅ Token found:', token.substring(0, 20) + '...');
} else {
  console.log('❌ No token found');
}

if (user) {
  const userData = JSON.parse(user);
  console.log('✅ User logged in:', userData);
  console.log('   - Role:', userData.role);
  console.log('   - Name:', userData.name);
  console.log('   - Email:', userData.email);
} else {
  console.log('❌ No user data found');
}

console.log('\n================================\n');

// Check 2: API Connectivity
console.log('2️⃣  Testing API Endpoints:\n');

// Test doctors endpoint
fetch('http://localhost:3000/api/v1/doctors')
  .then(r => r.json())
  .then(data => {
    console.log('✅ GET /doctors:');
    console.log('   Status:', data.status);
    console.log('   Doctors count:', data.results || 0);
    if (data.data?.doctors?.length > 0) {
      console.log('   First doctor:', data.data.doctors[0].firstName, data.data.doctors[0].lastName);
    } else {
      console.log('   ⚠️  No doctors in response!');
    }
  })
  .catch(err => console.log('❌ GET /doctors failed:', err.message));

// Test patients endpoint (requires auth)
setTimeout(() => {
  fetch('http://localhost:3000/api/v1/patients', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(data => {
      console.log('\n✅ GET /patients:');
      console.log('   Status:', data.status);
      console.log('   Patients count:', data.results || 0);
      if (data.data?.patients?.length > 0) {
        console.log('   First patient:', data.data.patients[0].firstName, data.data.patients[0].lastName);
      } else {
        console.log('   ⚠️  No patients in response!');
      }
    })
    .catch(err => console.log('❌ GET /patients failed:', err.message));
}, 1000);

console.log('\n================================');
console.log('Check the output above ⬆️');
console.log('================================');
