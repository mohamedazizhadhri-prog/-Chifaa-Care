import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (!process.env['CONFIRM_DELETE']) {
    console.error('CONFIRM_DELETE not set. To run deletion, set the env var and re-run. Example (PowerShell):');
    console.error("  $env:CONFIRM_DELETE='1'; npm run delete:english-doctors");
    process.exit(1);
  }

  const doctors = await prisma.user.findMany({
    where: {
      role: 'DOCTOR',
      doctorProfile: {
        is: {
          OR: [
            { languages: { contains: 'Anglais' } },
            { languages: { contains: 'anglais' } },
            { languages: { contains: 'English' } },
            { languages: { contains: 'english' } },
          ],
        },
      },
    },
    include: { doctorProfile: true },
  });

  if (!doctors || doctors.length === 0) {
    console.log('No English doctors found to delete.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Deleting ${doctors.length} doctor(s)...`);

  for (const d of doctors) {
    try {
      console.log(`Deleting user ${d.id} (${d.email})`);
      // Delete dependent records in safe order to satisfy FK constraints
      const userId = d.id;

      // 1) DoctorProfile and related Education
      const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId } });
      if (doctorProfile) {
        await prisma.education.deleteMany({ where: { doctorProfileId: doctorProfile.id } });
      }

      // 2) TreatmentNotes authored by this doctor
      await prisma.treatmentNote.deleteMany({ where: { doctorId: userId } });

      // 3) TreatmentPlans (delete medications and notes belonging to plans)
      const plans = await prisma.treatmentPlan.findMany({ where: { doctorId: userId }, select: { id: true } });
      const planIds = plans.map((p) => p.id);
      if (planIds.length > 0) {
        await prisma.medication.deleteMany({ where: { planId: { in: planIds } } });
        await prisma.treatmentNote.deleteMany({ where: { planId: { in: planIds } } });
        await prisma.treatmentPlan.deleteMany({ where: { id: { in: planIds } } });
      }

      // 4) Messages where the doctor is sender or recipient
      await prisma.message.deleteMany({ where: { OR: [{ senderId: userId }, { recipientId: userId }] } });

      // 5) Appointments and related payments
      const appts = await prisma.appointment.findMany({ where: { doctorId: userId }, select: { id: true } });
      const apptIds = appts.map((a) => a.id);
      if (apptIds.length > 0) {
        // delete payments referencing appointments
        await prisma.payment.deleteMany({ where: { appointmentId: { in: apptIds } } });
        // delete messages attached to appointments (already deleted above by sender/recipient but keep for safety)
        await prisma.message.deleteMany({ where: { appointmentId: { in: apptIds } } });
        // delete appointments
        await prisma.appointment.deleteMany({ where: { id: { in: apptIds } } });
      }

      // 6) Push subscriptions, user roles, other user-scoped resources
      await prisma.pushSubscription.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.userRole.deleteMany({ where: { userId } }).catch(() => {});

      // 7) Finally delete doctorProfile and user
      await prisma.doctorProfile.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    } catch (err) {
      console.error(`Failed to delete user ${d.id}:`, err);
    }
  }

  await prisma.$disconnect();
  console.log('Deletion completed.');
}

main().catch((err) => {
  console.error('Delete script failed:', err);
  process.exit(1);
});
