#!/usr/bin/env node

/**
 * Startup Configuration Checker
 * Run this before starting your backend to verify configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ChifaaCare Backend Configuration Checker\n');
console.log('='.repeat(50));

// Check .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('   Create one from .env.example or add environment variables\n');
  process.exit(1);
} else {
  console.log('✅ .env file found');
}

// Load .env
require('dotenv').config({ path: envPath });

// Check required variables
const checks = [
  {
    name: 'DATABASE_URL',
    required: true,
    value: process.env.DATABASE_URL,
    message: 'Database connection string'
  },
  {
    name: 'JWT_SECRET',
    required: true,
    value: process.env.JWT_SECRET,
    message: 'JWT authentication secret'
  },
  {
    name: 'ENCRYPTION_KEY',
    required: true,
    value: process.env.ENCRYPTION_KEY,
    message: 'Data encryption key'
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    value: process.env.STRIPE_SECRET_KEY,
    message: 'Stripe API key (for payments)',
    placeholder: 'sk_test_your_stripe_secret_key_here'
  },
  {
    name: 'CLOUDINARY_URL',
    required: false,
    value: process.env.CLOUDINARY_URL,
    message: 'Cloudinary URL (for image uploads)',
    placeholder: 'cloudinary://your_api_key:your_api_secret@your_cloud_name'
  }
];

console.log('\n📋 Configuration Status:\n');

let hasErrors = false;
let hasWarnings = false;

checks.forEach(check => {
  const status = check.value ? '✅' : (check.required ? '❌' : '⚠️');
  const statusText = check.value ? 'Configured' : (check.required ? 'MISSING (Required)' : 'Not configured (Optional)');
  
  console.log(`${status} ${check.name.padEnd(25)} - ${statusText}`);
  console.log(`   ${check.message}`);
  
  if (check.placeholder && check.value === check.placeholder) {
    console.log(`   ⚠️  Using placeholder value - update with real key`);
    hasWarnings = true;
  }
  
  if (!check.value && check.required) {
    hasErrors = true;
  }
  
  if (!check.value && !check.required) {
    hasWarnings = true;
  }
  
  console.log('');
});

console.log('='.repeat(50));
console.log('\n📊 Summary:\n');

if (hasErrors) {
  console.log('❌ ERRORS: Required configuration is missing');
  console.log('   Backend will NOT start. Please add required variables to .env\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  WARNINGS: Some optional features are not configured');
  console.log('   Backend will start, but some features may be disabled');
  console.log('   - Payment features require STRIPE_SECRET_KEY');
  console.log('   - Image uploads require CLOUDINARY_URL\n');
  console.log('✅ Ready to start! Run: npm run dev\n');
} else {
  console.log('✅ All configuration complete!');
  console.log('   Backend is fully configured and ready to start\n');
  console.log('🚀 Run: npm run dev\n');
}

console.log('📚 For setup instructions, see: ENV_SETUP_GUIDE.md');
console.log('📝 For fix details, see: STRIPE_FIX_SUMMARY.md\n');
