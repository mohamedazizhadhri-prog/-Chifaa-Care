const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check failed logins in last 30 minutes
  const failedLogins = await prisma.auditLog.findMany({
    where: {
      action: 'LOGIN_ATTEMPT',
      status: 'FAILED',
      createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log('Recent failed logins:', failedLogins);
  
  // Verify admin account
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@chifaacare.com' }
  });
  console.log('Admin account status:', admin);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
