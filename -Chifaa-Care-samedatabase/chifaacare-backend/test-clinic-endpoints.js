// Test Clinics API Endpoints
// Run this after starting the backend server

const BASE_URL = 'http://localhost:3000/api/v1';

// You'll need to replace this with an actual admin JWT token
const ADMIN_TOKEN = 'YOUR_ADMIN_JWT_TOKEN_HERE';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_TOKEN}`
};

async function testClinicEndpoints() {
  console.log('🏥 Testing Clinics API Endpoints...\n');

  try {
    // 1. Get all clinics
    console.log('1️⃣ Testing GET /admin/clinics');
    const listResponse = await fetch(`${BASE_URL}/admin/clinics`, { 
      headers 
    });
    const clinics = await listResponse.json();
    console.log('✅ Status:', listResponse.status);
    console.log('✅ Response:', JSON.stringify(clinics, null, 2));
    console.log('\n');

    // 2. Create a clinic
    console.log('2️⃣ Testing POST /admin/clinics');
    const newClinic = {
      name: 'Test Clinic ' + Date.now(),
      email: `testclinic${Date.now()}@example.com`,
      phone: '+1234567890',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      postalCode: '12345',
      status: 'PENDING',
      onboardingStep: 'REGISTRATION'
    };

    const createResponse = await fetch(`${BASE_URL}/admin/clinics`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newClinic)
    });
    const created = await createResponse.json();
    console.log('✅ Status:', createResponse.status);
    console.log('✅ Response:', JSON.stringify(created, null, 2));
    console.log('\n');

    const clinicId = created.data?.id;

    if (clinicId) {
      // 3. Get single clinic
      console.log('3️⃣ Testing GET /admin/clinics/:id');
      const getOneResponse = await fetch(`${BASE_URL}/admin/clinics/${clinicId}`, { 
        headers 
      });
      const clinic = await getOneResponse.json();
      console.log('✅ Status:', getOneResponse.status);
      console.log('✅ Response:', JSON.stringify(clinic, null, 2));
      console.log('\n');

      // 4. Update clinic
      console.log('4️⃣ Testing PUT /admin/clinics/:id');
      const updateResponse = await fetch(`${BASE_URL}/admin/clinics/${clinicId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          ...newClinic,
          name: 'Updated Test Clinic',
          status: 'ACTIVE'
        })
      });
      const updated = await updateResponse.json();
      console.log('✅ Status:', updateResponse.status);
      console.log('✅ Response:', JSON.stringify(updated, null, 2));
      console.log('\n');

      // 5. Update status only
      console.log('5️⃣ Testing PATCH /admin/clinics/:id/status');
      const statusResponse = await fetch(`${BASE_URL}/admin/clinics/${clinicId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'SUSPENDED' })
      });
      const statusUpdated = await statusResponse.json();
      console.log('✅ Status:', statusResponse.status);
      console.log('✅ Response:', JSON.stringify(statusUpdated, null, 2));
      console.log('\n');

      // 6. Delete clinic
      console.log('6️⃣ Testing DELETE /admin/clinics/:id');
      const deleteResponse = await fetch(`${BASE_URL}/admin/clinics/${clinicId}`, {
        method: 'DELETE',
        headers
      });
      const deleted = await deleteResponse.json();
      console.log('✅ Status:', deleteResponse.status);
      console.log('✅ Response:', JSON.stringify(deleted, null, 2));
      console.log('\n');
    }

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Instructions to get admin token:
console.log(`
📝 HOW TO GET ADMIN TOKEN:
1. Start the backend: cd chifaacare-backend && npm run dev
2. Login as admin through the frontend or use Postman
3. Copy the JWT token from the response
4. Replace ADMIN_TOKEN in this file
5. Run: node test-clinic-endpoints.js

OR use this curl command to login:
curl -X POST http://localhost:3000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@chifaacare.com","password":"your_admin_password"}'
`);

// Uncomment to run tests
// testClinicEndpoints();
