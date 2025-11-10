const fs = require('fs');
const crypto = require('crypto');

// Generate secure random strings
const jwtSecret = crypto.randomBytes(32).toString('hex');
const encryptionKey = crypto.randomBytes(32).toString('hex');

const envContent = `# Database
DATABASE_URL="postgresql://postgres:uranya@localhost:5432/mydb?schema=public"

# JWT
JWT_SECRET="${jwtSecret}"
JWT_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="${encryptionKey}"

# Server
PORT=3000
NODE_ENV="development"
`;

// Write to .env file
fs.writeFileSync('.env', envContent);

console.log('✅ .env file created successfully!');
console.log('🔑 JWT Secret and Encryption Key have been generated.');
console.log('Please restart your server for changes to take effect.');
