#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ChifaaCare Neon Database Migration Script');
console.log('=============================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json') || !fs.existsSync('chifaacare-backend')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Check if .env exists in backend
const envPath = path.join('chifaacare-backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  try {
    execSync('npm run setup:neon', { cwd: 'chifaacare-backend', stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Test connection
console.log('\n🔄 Testing Neon database connection...');
try {
  execSync('npm run test:neon', { cwd: 'chifaacare-backend', stdio: 'inherit' });
} catch (error) {
  console.error('❌ Database connection test failed');
  console.log('\n💡 Please check:');
  console.log('   1. Your Neon database URL in .env file');
  console.log('   2. Your Neon project is active');
  console.log('   3. Network connectivity');
  process.exit(1);
}

// Setup database
console.log('\n🗄️ Setting up database schema...');
try {
  execSync('npm run setup:db', { cwd: 'chifaacare-backend', stdio: 'inherit' });
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}

// Deploy migrations
console.log('\n📦 Deploying database migrations...');
try {
  execSync('npm run migrate:deploy', { cwd: 'chifaacare-backend', stdio: 'inherit' });
} catch (error) {
  console.error('❌ Migration deployment failed:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npm run prisma:generate', { cwd: 'chifaacare-backend', stdio: 'inherit' });
} catch (error) {
  console.error('❌ Prisma client generation failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Neon database migration completed successfully!');
console.log('\n📝 Next steps:');
console.log('   1. Start the backend server: cd chifaacare-backend && npm run dev');
console.log('   2. Start the frontend: npm start');
console.log('   3. Visit http://localhost:4200 for the frontend');
console.log('   4. Visit http://localhost:3000/api-docs for API documentation');
console.log('\n🔗 Useful commands:');
console.log('   - Test connection: cd chifaacare-backend && npm run test:neon');
console.log('   - View database: cd chifaacare-backend && npm run prisma:studio');
console.log('   - Seed database: cd chifaacare-backend && npm run seed:safe');
