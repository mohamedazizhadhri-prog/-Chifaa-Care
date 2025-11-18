const fs = require('fs');
const crypto = require('crypto');

// Generate secure random strings
const jwtSecret = crypto.randomBytes(32).toString('hex');
const encryptionKey = crypto.randomBytes(32).toString('hex');

const envContent = `# Neon Database Configuration
# Replace the connection string with your actual Neon database URL
# Format: postgresql://username:password@hostname:port/database?sslmode=require
DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# JWT Configuration
JWT_SECRET="${jwtSecret}"
JWT_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="${encryptionKey}"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:4200"

# Session Configuration
SESSION_SECRET="${crypto.randomBytes(32).toString('hex')}"
`;

// Write to .env file
fs.writeFileSync('.env', envContent);

console.log('✅ .env file created successfully for Neon database!');
console.log('🔑 JWT Secret, Encryption Key, and Session Secret have been generated.');
console.log('');
console.log('📝 IMPORTANT: Please update the following in your .env file:');
console.log('   1. Replace DATABASE_URL with your actual Neon database connection string');
console.log('   2. Update Cloudinary credentials if using file uploads');
console.log('   3. Update Stripe credentials if using payments');
console.log('   4. Update email configuration if using email features');
console.log('');
console.log('🔗 To get your Neon database URL:');
console.log('   1. Go to https://console.neon.tech/');
console.log('   2. Create a new project or select existing one');
console.log('   3. Go to Connection Details');
console.log('   4. Copy the connection string');
console.log('');
console.log('Please restart your server for changes to take effect.');
