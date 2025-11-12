const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testAuth() {
  // 1. Verify admin account
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@chifaacare.com' },
    select: { password: true }
  });
  
  if (!admin) throw new Error('Admin account not found');
  
  // 2. Test password match
  const valid = await bcrypt.compare('admin123', admin.password);
  console.log(`Password match: ${valid}`);
  
  // 3. Check JWT secret
  console.log(`JWT_SECRET length: ${process.env.JWT_SECRET?.length || 'NOT SET'}`);
}

testAuth()
  .catch(e => console.error('Debug failed:', e))
  .finally(() => prisma.$disconnect());
