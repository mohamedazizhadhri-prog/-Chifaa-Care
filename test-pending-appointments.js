// TEST SCRIPT: Check Pending Appointments
// Run this in browser console at http://localhost:4200/doctor/patients

console.log('🔍 STARTING DIAGNOSTIC TEST...\n');

// Test 1: Check Current User
console.log('=== TEST 1: CURRENT USER ===');
const userStr = localStorage.getItem('currentUser');
const user = userStr ? JSON.parse(userStr) : null;
if (!user) {
  console.error('❌ NO USER FOUND - You need to login first');
} else {
  console.log('✅ User ID:', user.id);
  console.log('✅ Role:', user.role);
  console.log('✅ Name:', user.firstName, user.lastName);
  console.log('✅ Email:', user.email);
  
  if (user.role?.toUpperCase() !== 'DOCTOR') {
    console.error('❌ WRONG ROLE - You must be logged in as a DOCTOR, not:', user.role);
  }
}
console.log('');

// Test 2: Check Token
console.log('=== TEST 2: AUTH TOKEN ===');
const token = localStorage.getItem('token');
if (!token) {
  console.error('❌ NO TOKEN FOUND - You need to login first');
} else {
  console.log('✅ Token exists');
  console.log('✅ Token length:', token.length);
}
console.log('');

// Test 3: Fetch Appointments
if (user && token && user.role?.toUpperCase() === 'DOCTOR') {
  console.log('=== TEST 3: FETCHING APPOINTMENTS ===');
  console.log('Requesting:', `http://localhost:3000/api/v1/appointments?doctorId=${user.id}&status=PENDING`);
  
  fetch(`http://localhost:3000/api/v1/appointments?doctorId=${user.id}&status=PENDING`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('✅ Response received:');
    console.log('   Status:', data.status);
    console.log('   Results count:', data.results);
    console.log('   Appointments:', data.data?.appointments);
    
    const appointments = data.data?.appointments || [];
    console.log('');
    console.log('=== ANALYSIS ===');
    console.log('Total pending appointments:', appointments.length);
    
    if (appointments.length === 0) {
      console.warn('⚠️  NO PENDING APPOINTMENTS FOUND');
      console.log('');
      console.log('Possible reasons:');
      console.log('1. No appointments have been created yet');
      console.log('2. All appointments are CONFIRMED (not PENDING)');
      console.log('3. Appointments belong to a different doctor');
      console.log('');
      console.log('💡 SOLUTION: Create a test appointment');
      console.log('   1. Logout and login as PATIENT');
      console.log('   2. Go to "Book Consultation"');
      console.log('   3. Select this doctor');
      console.log('   4. Complete payment');
      console.log('   5. Check if appointment stays PENDING');
    } else {
      console.log('✅ FOUND PENDING APPOINTMENTS:');
      appointments.forEach((apt, i) => {
        console.log(`\n  Appointment ${i + 1}:`);
        console.log('    ID:', apt.id);
        console.log('    Status:', apt.status);
        console.log('    Patient:', apt.patient?.firstName, apt.patient?.lastName);
        console.log('    Date:', new Date(apt.appointmentDate).toLocaleString());
        console.log('    Reason:', apt.reason);
      });
    }
  })
  .catch(error => {
    console.error('❌ ERROR FETCHING APPOINTMENTS:', error);
    console.log('');
    console.log('Possible causes:');
    console.log('1. Backend is not running');
    console.log('2. Backend is running on different port');
    console.log('3. Token is expired or invalid');
    console.log('4. CORS issues');
    console.log('');
    console.log('💡 TRY:');
    console.log('   1. Make sure backend is running: cd chifaacare-backend && npm run dev');
    console.log('   2. Logout and login again to get fresh token');
  });
  
  // Test 4: Check All Appointments (not just pending)
  setTimeout(() => {
    console.log('\n=== TEST 4: CHECKING ALL APPOINTMENTS ===');
    fetch(`http://localhost:3000/api/v1/appointments?doctorId=${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      const all = data.data?.appointments || [];
      console.log('Total appointments (all statuses):', all.length);
      
      const byStatus = {};
      all.forEach(apt => {
        byStatus[apt.status] = (byStatus[apt.status] || 0) + 1;
      });
      
      console.log('Breakdown by status:');
      Object.keys(byStatus).forEach(status => {
        console.log(`  ${status}: ${byStatus[status]}`);
      });
      
      if (all.length > 0) {
        console.log('\nMost recent appointments:');
        all.slice(0, 5).forEach(apt => {
          console.log(`  - ${apt.status} | ${apt.patient?.firstName} ${apt.patient?.lastName} | ${new Date(apt.appointmentDate).toLocaleDateString()}`);
        });
      }
    })
    .catch(err => console.error('Error:', err));
  }, 1000);
}

console.log('\n✅ DIAGNOSTIC TEST COMPLETE');
console.log('Review the results above to identify the issue');
