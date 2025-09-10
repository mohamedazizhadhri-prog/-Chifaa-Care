import '../src/env';
import prisma from '../src/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Resetting database and seeding exactly 3 accounts...');
  // Wipe data in FK-safe order
  await prisma.education.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doctorProfile.deleteMany({});
  await prisma.medicalHistory.deleteMany({});
  await prisma.emergencyContact.deleteMany({});
  await prisma.insuranceInfo.deleteMany({});
  await prisma.patientProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('P@ssw0rd123!', 10);

  // Doctor 1
  const drJane = await prisma.user.create({
    data: {
      email: 'dr.jane@example.com',
      password: passwordHash,
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

  // Doctor 2
  const drAhmed = await prisma.user.create({
    data: {
      email: 'dr.ahmed@example.com',
      password: passwordHash,
      firstName: 'Ahmed',
      lastName: 'Karim',
      role: 'DOCTOR',
      isEmailVerified: true,
      doctorProfile: {
        create: {
          specialization: 'Dermatology',
          bio: 'Skin care and chronic conditions',
          licenseNumber: 'DOC200200',
          experience: 8,
          consultationFee: 150,
          availableDays: JSON.stringify(['Tuesday','Thursday']),
          availableHours: JSON.stringify(['10:00-13:00','15:00-18:00'])
        }
      }
    }
  });

  // Patient
  const patientAlex = await prisma.user.create({
    data: {
      email: 'patient.alex@example.com',
      password: passwordHash,
      firstName: 'Alex',
      lastName: 'Smith',
      role: 'PATIENT',
      isEmailVerified: true,
      patientProfile: {
        create: {
          bloodType: 'A+',
          height: 178,
          weight: 74,
          allergies: JSON.stringify([]),
          medications: JSON.stringify([])
        }
      }
    }
  });

  console.log('Seeded users:');
  console.log(' - Doctor 1:', drJane.email);
  console.log(' - Doctor 2:', drAhmed.email);
  console.log(' - Patient  :', patientAlex.email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
