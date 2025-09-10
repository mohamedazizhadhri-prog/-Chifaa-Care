import '../src/env';
import prisma from '../src/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const password = await bcrypt.hash('P@ssw0rd123!', 10);

  // Upsert Doctor
  const doctorEmail = 'dr.jane@example.com';
  const doctor = await prisma.user.upsert({
    where: { email: doctorEmail },
    update: {},
    create: {
      email: doctorEmail,
      password,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'DOCTOR',
      isEmailVerified: true,
      doctorProfile: {
        create: {
          specialization: 'Cardiology',
          bio: 'Board-certified cardiologist',
          licenseNumber: 'DOC100100',
          experience: 10,
          consultationFee: 200,
          availableDays: JSON.stringify(['Monday','Wednesday','Friday']),
          availableHours: JSON.stringify(['09:00-12:00','14:00-17:00'])
        }
      }
    }
  });

  // Upsert Patient
  const patientEmail = 'patient.alex@example.com';
  const patient = await prisma.user.upsert({
    where: { email: patientEmail },
    update: {},
    create: {
      email: patientEmail,
      password,
      firstName: 'Alex',
      lastName: 'Smith',
      role: 'PATIENT',
      isEmailVerified: true,
      patientProfile: {
        create: {
          bloodType: 'A+',
          height: 180,
          weight: 75,
          allergies: JSON.stringify([]),
          medications: JSON.stringify([])
        }
      }
    }
  });

  console.log('Created/ensured doctor:', doctor.email, doctor.id);
  console.log('Created/ensured patient:', patient.email, patient.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
