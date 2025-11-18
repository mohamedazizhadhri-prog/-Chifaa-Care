const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check admin account
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@chifaacare.com' },
    select: {
      id: true,
      email: true,
      isActive: true,
      role: true,
      lastLogin: true
    }
  });
  
  if (!admin) {
    console.log('❌ Admin account not found');
  } else if (!admin.isActive) {
    console.log('⚠️ Admin account exists but is INACTIVE');
  } else {
    console.log('✅ Admin account exists and is active:', admin);
  }
}

main()
  .catch(e => console.error('Database error:', e))
  .finally(() => prisma.$disconnect());
