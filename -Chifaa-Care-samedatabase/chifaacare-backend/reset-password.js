const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'Test@1234'; // Strong password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update the test user's password
  const updatedUser = await prisma.user.update({
    where: { email: 'test@example.com' },
    data: {
      password: hashedPassword,
      isEmailVerified: true,
      isActive: true
    }
  });
  
  console.log('Password has been reset for test@example.com');
  console.log('New password:', newPassword);
  console.log('User details:', {
    email: updatedUser.email,
    isActive: updatedUser.isActive,
    isEmailVerified: updatedUser.isEmailVerified
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
