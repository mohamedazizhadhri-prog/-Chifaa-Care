const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  const email = process.argv[2];
  const specialization = process.argv[3];
  if (!email || !specialization) {
    console.error('Usage: node update-doctor-specialization.js <email> "<Specialization>"');
    process.exit(1);
  }
  try {
    const user = await prisma.user.findUnique({ where: { email }, include: { doctorProfile: true } });
    if (!user) {
      console.error('User not found:', email);
      process.exit(2);
    }
    if (!user.doctorProfile) {
      console.error('User has no doctorProfile:', email);
      process.exit(3);
    }
    const updated = await prisma.doctorProfile.update({
      where: { id: user.doctorProfile.id },
      data: { specialization }
    });
    console.log('Updated doctor profile:', JSON.stringify({ email, specialization: updated.specialization }, null, 2));
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
