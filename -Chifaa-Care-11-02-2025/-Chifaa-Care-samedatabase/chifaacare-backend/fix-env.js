// Check and fix .env file for Supabase connection
const fs = require('fs');

const envPath = '.env';
const supabaseUrl = 'postgresql://postgres:[YOUR_PASSWORD]@db.xyneroejctxtfpokfjqu.supabase.co:5432/postgres?schema=public';

try {
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update DATABASE_URL line
  const lines = envContent.split('\n');
  let updated = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('DATABASE_URL=')) {
      lines[i] = `DATABASE_URL="${supabaseUrl}"`;
      updated = true;
      break;
    }
  }

  if (updated) {
    fs.writeFileSync(envPath, lines.join('\n'));
    console.log('✅ Updated DATABASE_URL in .env file');
    console.log('📝 Please replace [YOUR_PASSWORD] with your actual Supabase password');
  } else {
    console.log('❌ Could not find DATABASE_URL in .env file');
  }

} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
}
