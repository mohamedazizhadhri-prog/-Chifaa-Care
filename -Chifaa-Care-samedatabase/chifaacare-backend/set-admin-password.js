const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = 'admin@chifaacare.com';
    const newPassword = 'admin123';
    const hash = await bcrypt.hash(newPassword, 10);
    const user = await prisma.user.update({
      where: { email },
      data: { password: hash, isActive: true, isEmailVerified: true }
    });
    console.log('✅ Updated admin password:', user.email);
  } catch (err) {
    console.error('❌ Error updating admin password:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
