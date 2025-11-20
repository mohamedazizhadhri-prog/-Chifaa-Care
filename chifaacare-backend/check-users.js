const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Check existing users
  const users = await prisma.user.findMany();
  console.log('Existing users:', users);
  
  // If no users exist, create a test user
  if (users.length === 0) {
    console.log('No users found. Creating a test user...');
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
        isEmailVerified: true
      }
    });
    console.log('Created test user:', {
      email: testUser.email,
      id: testUser.id,
      role: testUser.role
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
