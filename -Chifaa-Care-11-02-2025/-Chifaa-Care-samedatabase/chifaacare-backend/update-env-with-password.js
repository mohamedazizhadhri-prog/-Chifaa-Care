// Update .env file with actual Supabase password
const fs = require('fs');

const password = 'X%t-x4K@CKL5_CY';
const envPath = '.env';

try {
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update DATABASE_URL with actual password
  const supabaseUrl = `postgresql://postgres:${password}@db.xyneroejctxtfpokfjqu.supabase.co:5432/postgres?schema=public`;
  envContent = envContent.replace(/DATABASE_URL="[^"]*"/, `DATABASE_URL="${supabaseUrl}"`);

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env file with your Supabase password');
  console.log('🚀 Ready to deploy to Supabase!');

} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
}
