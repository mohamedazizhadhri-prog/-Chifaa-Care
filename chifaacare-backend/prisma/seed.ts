import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in the correct order to avoid foreign key constraint errors
  await prisma.education.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doctorProfile.deleteMany({});
  await prisma.medicalHistory.deleteMany({});
  await prisma.emergencyContact.deleteMany({});
  await prisma.insuranceInfo.deleteMany({});
  await prisma.patientProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create a test patient
  const patient = await prisma.user.create({
    data: {
      email: 'patient@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'MALE',
      role: 'PATIENT',
      isEmailVerified: true,
      patientProfile: {
        create: {
          bloodType: 'O+',
          height: 175,
          weight: 70,
          allergies: JSON.stringify(['Peanuts', 'Penicillin']),
          medications: JSON.stringify(['Aspirin', 'Vitamin D'])
        }
      }
    }
  });

  // --- Create 5 Test Doctors ---

  const doctor1 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@example.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1987654321',
      role: 'DOCTOR',
      isEmailVerified: true,
      doctorProfile: {
        create: {
          specialization: 'Cardiologist',
          bio: 'Board certified cardiologist with 10+ years of experience in treating complex heart conditions.',
          licenseNumber: 'DOC123456',
          experience: 12,
          consultationFee: 250,
          availableDays: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
          availableHours: JSON.stringify(['09:00-12:00', '14:00-17:00'])
        }
      }
    }
  });

  const doctor2 = await prisma.user.create({
    data: {
      email: 'emily.chen@example.com',
      password: hashedPassword,
      firstName: 'Emily',
      lastName: 'Chen',
      phone: '+1122334455',
      role: 'DOCTOR',
      isEmailVerified: true,
      doctorProfile: {
        create: {
          specialization: 'Oncologist',
          bio: 'Dedicated oncologist specializing in breast cancer research and advanced therapies.',
          licenseNumber: 'DOC789012',
          experience: 15,
          consultationFee: 300,
          availableDays: JSON.stringify(['Tuesday', 'Thursday']),
          availableHours: JSON.stringify(['10:00-13:00', '15:00-18:00'])
        }
      }
    }
  });

  const doctor3 = await prisma.user.create({
    data: {
      email: 'michael.brown@example.com',
      password: hashedPassword,
      firstName: 'Michael',
      lastName: 'Brown',
      phone: '+1555666777',
      role: 'DOCTOR',
      isEmailVerified: true,
      doctorProfile: {
        create: {
          specialization: 'Neurologist',
          bio: 'Expert in neurological disorders, with a focus on epilepsy and stroke management.',
          licenseNumber: 'DOC345678',
          experience: 8,
          consultationFee: 200,
          availableDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday']),
          availableHours: JSON.stringify(['08:00-11:00', '13:00-16:00'])
        }
      }
    }
  });

  const doctor4 = await prisma.user.create({
    data: {
      email: 'jessica.davis@example.com',
      password: hashedPassword,
      firstName: 'Jessica',
      lastName: 'Davis',
      phone: '+1999888777',
      role: 'DOCTOR',
      isEmailVerified: true,
      doctorProfile: {
        create: {
          specialization: 'Dermatologist',
          bio: 'Specializing in cosmetic dermatology and treatment of chronic skin conditions.',
          licenseNumber: 'DOC901234',
          experience: 7,
          consultationFee: 180,
          availableDays: JSON.stringify(['Wednesday', 'Friday', 'Saturday']),
          availableHours: JSON.stringify(['11:00-15:00'])
        }
      }
    }
  });

  const doctor5 = await prisma.user.create({
    data: {
      email: 'david.wilson@example.com',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Wilson',
      phone: '+1444333222',
      role: 'DOCTOR',
      isEmailVerified: true,
      doctorProfile: {
        create: {
          specialization: 'Pediatrician',
          bio: 'Compassionate pediatrician committed to the health and well-being of children.',
          licenseNumber: 'DOC567890',
          experience: 10,
          consultationFee: 160,
          availableDays: JSON.stringify(['Monday', 'Thursday', 'Friday']),
          availableHours: JSON.stringify(['09:00-17:00'])
        }
      }
    }
  });

  // Create a test appointment
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 2); // 2 days from now
  appointmentDate.setHours(14, 30, 0, 0); // Set to 2:30 PM
  
  const endTime = new Date(appointmentDate);
  endTime.setHours(appointmentDate.getHours() + 1); // 1 hour appointment
  
  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor1.id,
      appointmentDate: appointmentDate,
      endTime: endTime,
      status: 'PENDING',
      reason: 'Routine checkup',
      notes: 'Patient has a history of high blood pressure',
      diagnosis: null,
      prescription: null,
      isFollowUp: false
    }
  });

  // Create a Treatment Plan for the patient with medications and notes
  // Use raw SQL to avoid dependency on generated Prisma client delegates when running in CI/locked environments
  const planRow = await prisma.$queryRawUnsafe<any[]>(
    `INSERT INTO "TreatmentPlan" (id, "patientId", "doctorId", title, diagnosis, goals, "carePlan", status, "startDate", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'ACTIVE', now(), now(), now()) RETURNING id`,
    patient.id,
    doctor1.id,
    'Hypertension Management Plan',
    'Essential hypertension',
    'Reduce BP to <130/80; improve lifestyle; monitor labs',
    'DASH diet, exercise 150 min/week, medication adherence, monthly follow-up'
  );
  const planId: string = planRow?.[0]?.id;

  if (planId) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "TreatmentNote" (id, "planId", "doctorId", content, "isImportant", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, now())`,
      planId,
      doctor1.id,
      'Baseline assessment completed. Initiate low-sodium diet. Encourage daily walking 30 minutes.',
      true
    );

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Medication" (id, "planId", name, dose, frequency, route, instructions, "startDate", "isActive")
       VALUES
       (gen_random_uuid(), $1, 'Amlodipine', '5 mg', 'once daily', 'oral', 'Take at night', now(), true),
       (gen_random_uuid(), $1, 'Atorvastatin', '20 mg', 'once daily', 'oral', 'Take at night', now(), true)`,
      planId
    );
  }

  // Create a Medical Record entry with an example attachment
  const patientProfile = await prisma.patientProfile.findFirst({ where: { userId: patient.id } });
  if (patientProfile) {
    const record = await prisma.medicalHistory.create({
      data: {
        patientProfileId: patientProfile.id,
        condition: 'Baseline Lab Panel',
        diagnosisDate: new Date(),
        status: 'OPEN',
        notes: 'Awaiting results from standard lipid panel and CMP.',
        attachments: JSON.stringify([
          { url: 'https://example.com/labs/request.pdf', name: 'Lab Requisition', addedAt: new Date().toISOString() }
        ])
      }
    });
  }

  console.log('Database seeded with 1 patient and 5 doctors successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
