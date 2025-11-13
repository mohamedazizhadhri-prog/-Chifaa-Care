const jwt = require('jsonwebtoken');
require('dotenv').config();

const payload = {
  id: 'test-id',
  role: 'ADMIN'
};

try {
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  console.log('✅ JWT generated successfully');
  console.log('Sample token:', token.slice(0, 50) + '...');
  
  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('🔐 Decoded token:', decoded);
} catch (err) {
  console.error('❌ JWT generation failed:', err.message);
}
