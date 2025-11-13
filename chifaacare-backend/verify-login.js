const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  const email = process.argv[2] || 'test@example.com';
  const password = process.argv[3] || 'Test@1234';
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('User not found:', email);
    return;
  }
  const match = await bcrypt.compare(password, user.password);
  console.log('User:', { email: user.email, isActive: user.isActive, isEmailVerified: user.isEmailVerified, role: user.role });
  console.log('Password matches:', match);
}

run().catch(e => console.error(e)).finally(async () => prisma.$disconnect());
