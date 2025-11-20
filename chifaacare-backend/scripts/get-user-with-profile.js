const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  const email = process.argv[2] || 'amira.pookie@example.com';
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { doctorProfile: true }
    });
    console.log(JSON.stringify(user, null, 2));
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
