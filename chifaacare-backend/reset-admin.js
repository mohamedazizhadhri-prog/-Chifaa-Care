const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  await prisma.user.update({
    where: { email: 'admin@chifaacare.com' },
    data: {
      password: hashedPassword,
      isActive: true,
      isEmailVerified: true
    }
  });
  
  console.log('✅ Admin password reset to "admin123"');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
