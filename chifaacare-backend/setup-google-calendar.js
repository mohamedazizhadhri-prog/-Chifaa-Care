/**
 * Google Calendar Setup Script
 * This script installs the required dependencies and verifies the setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Google Calendar Setup...\n');

// Step 1: Install googleapis package
console.log('📦 Step 1: Installing googleapis package...');
try {
  execSync('npm install googleapis', { stdio: 'inherit' });
  console.log('✅ googleapis installed successfully!\n');
} catch (error) {
  console.error('❌ Failed to install googleapis:', error.message);
  process.exit(1);
}

// Step 2: Verify .env file
console.log('🔍 Step 2: Verifying .env configuration...');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI'
];

let allFound = true;
requiredVars.forEach(varName => {
  if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=""`)) {
    console.log(`✅ ${varName} is configured`);
  } else {
    console.log(`❌ ${varName} is missing or empty`);
    allFound = false;
  }
});

if (!allFound) {
  console.error('\n❌ Some required environment variables are missing!');
  console.log('\nPlease add the following to your .env file:');
  console.log('GOOGLE_CLIENT_ID="your_client_id_here"');
  console.log('GOOGLE_CLIENT_SECRET="your_client_secret_here"');
  console.log('GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/calendar/oauth/callback"');
  process.exit(1);
}

console.log('\n✅ All environment variables are configured!\n');

// Step 3: Generate Prisma Client
console.log('🔧 Step 3: Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated successfully!\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error.message);
  process.exit(1);
}

// Step 4: Verify Google Calendar service file exists
console.log('🔍 Step 4: Verifying Google Calendar service...');
const servicePath = path.join(__dirname, 'src', 'services', 'google-calendar.service.ts');
if (fs.existsSync(servicePath)) {
  console.log('✅ Google Calendar service found!\n');
} else {
  console.error('❌ Google Calendar service file not found!');
  process.exit(1);
}

// Step 5: Summary
console.log('═══════════════════════════════════════════════════');
console.log('✅ SETUP COMPLETE!');
console.log('═══════════════════════════════════════════════════\n');

console.log('📋 Next Steps:');
console.log('1. Start the backend server:');
console.log('   npm run dev\n');
console.log('2. Test the Google Calendar OAuth flow:');
console.log('   - Login as a doctor');
console.log('   - Go to Calendar Settings');
console.log('   - Click "Connect Google Calendar"\n');
console.log('3. Test the appointment workflow:');
console.log('   - Patient books appointment');
console.log('   - Patient pays');
console.log('   - Doctor accepts');
console.log('   - Check Google Calendar for the event\n');

console.log('📚 Documentation:');
console.log('   - APPOINTMENT_WORKFLOW_COMPLETE.md');
console.log('   - WORKFLOW_VISUAL_GUIDE.md');
console.log('   - QUICK_SETUP_CHECKLIST.md\n');

console.log('🔗 API Endpoints Available:');
console.log('   GET  /api/v1/calendar/auth');
console.log('   GET  /api/v1/calendar/oauth/callback');
console.log('   GET  /api/v1/calendar/status');
console.log('   POST /api/v1/calendar/disconnect');
console.log('   GET  /api/v1/appointments/doctor/pending');
console.log('   POST /api/v1/appointments/:id/accept');
console.log('   POST /api/v1/appointments/:id/reject\n');

console.log('═══════════════════════════════════════════════════\n');
