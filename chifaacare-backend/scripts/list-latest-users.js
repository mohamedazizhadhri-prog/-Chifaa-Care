const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true }
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
