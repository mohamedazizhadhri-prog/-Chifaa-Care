// Update .env file with new Supabase connection string
const fs = require('fs');

const newEnvContent = `# Database
DATABASE_URL="postgresql://postgres:toIYqhMcikrHPcHB@db.xyneroejctxtfpokfjqu.supabase.co:5432/postgres?schema=public"

# JWT
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="your_256_bit_encryption_key_here_64_characters"

# Server
PORT=3000
NODE_ENV="development"
`;

try {
  fs.writeFileSync('.env', newEnvContent);
  console.log('✅ Updated .env file with new Supabase connection string');
  console.log('🚀 Ready to test connection and deploy schema!');
} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
}
