import { PrismaClient } from '@prisma/client';

async function cleanupRemainingUser() {
  const prisma = new PrismaClient();
  
  try {
    // Delete appointments first
    await prisma.appointment.deleteMany({
      where: {
        doctor: {
          email: 'sarah.johnson@example.com'
        }
      }
    });

    // Now delete the user
    await prisma.user.delete({
      where: { email: 'sarah.johnson@example.com' }
    });
    console.log('Successfully deleted remaining user record for sarah.johnson@example.com');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupRemainingUser();