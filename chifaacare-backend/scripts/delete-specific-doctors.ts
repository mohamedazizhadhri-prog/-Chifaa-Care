import { PrismaClient } from '@prisma/client';

const emails = [
  'michael.brown@example.com',
  'jessica.davis@example.com',
  'sarah.johnson@example.com',
  'emily.chen@example.com'
];

async function deleteSpecificDoctors() {
  const prisma = new PrismaClient();
  
  try {
    for (const email of emails) {
      // Get the user and their doctor profile
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          doctorProfile: true
        }
      });

      if (!user || !user.doctorProfile) {
        console.log(`User ${email} not found or is not a doctor`);
        continue;
      }

      // Delete appointments first
      await prisma.appointment.deleteMany({
        where: { doctorId: user.doctorProfile.id }
      });

      // Delete treatment plans
      await prisma.treatmentPlan.deleteMany({
        where: { doctorId: user.doctorProfile.id }
      });

      // Delete doctor profile
      await prisma.doctorProfile.delete({
        where: { id: user.doctorProfile.id }
      });

      // Finally delete the user
      await prisma.user.delete({
        where: { id: user.id }
      });

      console.log(`Successfully deleted doctor: ${email}`);
    }

    console.log('Deletion completed successfully');
  } catch (error) {
    console.error('Error during deletion:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSpecificDoctors();