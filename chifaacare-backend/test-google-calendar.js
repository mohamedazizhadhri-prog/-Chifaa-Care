/**
 * Test Google Calendar Integration
 * Run this after the backend is started to verify calendar setup
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const tests = {
  health: {
    name: 'Server Health Check',
    endpoint: '/api/health',
    method: 'GET'
  },
  calendarStatus: {
    name: 'Calendar Status (Requires Auth)',
    endpoint: '/api/v1/calendar/status',
    method: 'GET',
    requiresAuth: true
  }
};

async function makeRequest(endpoint, method = 'GET', token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Google Calendar Integration\n');
  console.log('═══════════════════════════════════════════════════\n');

  // Test 1: Health Check
  console.log('Test 1: Server Health Check');
  console.log('─────────────────────────────');
  try {
    const result = await makeRequest('/api/health');
    if (result.status === 200) {
      console.log('✅ Server is running');
      console.log(`   Status: ${result.data.status}`);
      console.log(`   Environment: ${result.data.environment}`);
    } else {
      console.log('❌ Server health check failed');
      console.log(`   Status: ${result.status}`);
    }
  } catch (error) {
    console.log('❌ Cannot connect to server');
    console.log(`   Error: ${error.message}`);
    console.log('\n⚠️  Please start the backend server first:');
    console.log('   npm run dev\n');
    process.exit(1);
  }
  console.log('');

  // Test 2: Environment Variables
  console.log('Test 2: Environment Variables Check');
  console.log('─────────────────────────────');
  const requiredEnvVars = {
    'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
    'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
    'GOOGLE_REDIRECT_URI': process.env.GOOGLE_REDIRECT_URI
  };

  let envOk = true;
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (value && value !== '' && !value.includes('your_')) {
      console.log(`✅ ${key}: Configured`);
    } else {
      console.log(`❌ ${key}: Missing or not configured`);
      envOk = false;
    }
  }

  if (!envOk) {
    console.log('\n⚠️  Environment variables not properly configured');
    console.log('   Please check your .env file\n');
  }
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 Manual Testing Steps:');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('1. Start Backend (if not already running):');
  console.log('   cd chifaacare-backend');
  console.log('   npm run dev\n');

  console.log('2. Test OAuth Flow (requires doctor account):');
  console.log('   a. Login as doctor in your frontend');
  console.log('   b. Get the auth token from browser (DevTools → Application → Local Storage)');
  console.log('   c. Make a request to initiate OAuth:');
  console.log('      curl -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('           http://localhost:3000/api/v1/calendar/auth');
  console.log('   d. Open the returned URL in browser');
  console.log('   e. Authorize with Google');
  console.log('   f. You should be redirected back\n');

  console.log('3. Test Appointment Flow:');
  console.log('   a. Patient books appointment (POST /api/v1/appointments)');
  console.log('   b. Patient pays (POST /api/v1/payment/create-intent)');
  console.log('   c. Doctor views pending (GET /api/v1/appointments/doctor/pending)');
  console.log('   d. Doctor accepts (POST /api/v1/appointments/:id/accept)');
  console.log('   e. Check Google Calendar for the event\n');

  console.log('4. Verify Calendar Event:');
  console.log('   - Open https://calendar.google.com');
  console.log('   - Look for "Consultation with [Patient Name]"');
  console.log('   - Event should have patient email as attendee\n');

  console.log('═══════════════════════════════════════════════════\n');

  console.log('📚 Available Endpoints:');
  console.log('   Auth Flow:');
  console.log('   - GET  /api/v1/calendar/auth (start OAuth)');
  console.log('   - GET  /api/v1/calendar/oauth/callback (Google redirect)');
  console.log('   - GET  /api/v1/calendar/status (check connection)');
  console.log('   - POST /api/v1/calendar/disconnect\n');

  console.log('   Appointments:');
  console.log('   - GET  /api/v1/appointments/doctor/pending');
  console.log('   - POST /api/v1/appointments/:id/accept');
  console.log('   - POST /api/v1/appointments/:id/reject');
  console.log('   - PATCH /api/v1/appointments/:id (reschedule)\n');

  console.log('═══════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
