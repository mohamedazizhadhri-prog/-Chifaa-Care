import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUserWithProfiles(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: 'PATIENT' | 'DOCTOR' | string;
  doctorProfile?: {
    specialization?: string | null;
    bio?: string | null;
    licenseNumber?: string | null;
    experience?: number | null;
    consultationFee?: number | null;
    availableDays?: string | null;
    availableHours?: string | null;
  };
  patientProfile?: {
    bloodType?: string | null;
    height?: number | null;
    weight?: number | null;
    allergies?: string | null;
    medications?: string | null;
  };
}) {
  const { email, password, firstName, lastName, phone, role } = params;
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      firstName,
      lastName,
      phone: phone ?? undefined,
      role,
      password: hashed,
      isEmailVerified: true,
    },
    create: {
      email,
      password: hashed,
      firstName,
      lastName,
      phone: phone ?? undefined,
      role,
      isEmailVerified: true,
    },
  });

  // Upsert doctor profile if requested
  if (role === 'DOCTOR' && params.doctorProfile) {
    const existing = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
    if (existing) {
      await prisma.doctorProfile.update({
        where: { userId: user.id },
        data: {
          specialization: params.doctorProfile.specialization ?? undefined,
          bio: params.doctorProfile.bio ?? undefined,
          licenseNumber: params.doctorProfile.licenseNumber ?? undefined,
          experience: params.doctorProfile.experience ?? undefined,
          consultationFee: params.doctorProfile.consultationFee ?? undefined,
          availableDays: params.doctorProfile.availableDays ?? undefined,
          availableHours: params.doctorProfile.availableHours ?? undefined,
        },
      });
    } else {
      await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          specialization: params.doctorProfile.specialization ?? null,
          bio: params.doctorProfile.bio ?? null,
          licenseNumber: params.doctorProfile.licenseNumber ?? null,
          experience: params.doctorProfile.experience ?? null,
          consultationFee: params.doctorProfile.consultationFee ?? null,
          availableDays: params.doctorProfile.availableDays ?? '[]',
          availableHours: params.doctorProfile.availableHours ?? '[]',
        },
      });
    }
  }

  // Upsert patient profile if requested
  if (role === 'PATIENT' && params.patientProfile) {
    const existing = await prisma.patientProfile.findUnique({ where: { userId: user.id } });
    if (existing) {
      await prisma.patientProfile.update({
        where: { userId: user.id },
        data: {
          bloodType: params.patientProfile.bloodType ?? undefined,
          height: params.patientProfile.height ?? undefined,
          weight: params.patientProfile.weight ?? undefined,
          allergies: params.patientProfile.allergies ?? undefined,
          medications: params.patientProfile.medications ?? undefined,
        },
      });
    } else {
      await prisma.patientProfile.create({
        data: {
          userId: user.id,
          bloodType: params.patientProfile.bloodType ?? null,
          height: params.patientProfile.height ?? null,
          weight: params.patientProfile.weight ?? null,
          allergies: params.patientProfile.allergies ?? '[]',
          medications: params.patientProfile.medications ?? '[]',
        },
      });
    }
  }

  return user;
}

async function main() {
  // Create or ensure baseline data
  const patient = await upsertUserWithProfiles({
    email: 'patient@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    role: 'PATIENT',
    patientProfile: {
      bloodType: 'O+',
      height: 175,
      weight: 70,
      allergies: JSON.stringify(['Peanuts', 'Penicillin']),
      medications: JSON.stringify(['Aspirin', 'Vitamin D']),
    },
  });

  const doctor1 = await upsertUserWithProfiles({
    email: 'sarah.johnson@example.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1987654321',
    role: 'DOCTOR',
    doctorProfile: {
      specialization: 'Cardiologist',
      bio: 'Board certified cardiologist with 10+ years of experience in treating complex heart conditions.',
      licenseNumber: 'DOC123456',
      experience: 12,
      consultationFee: 250,
      availableDays: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
      availableHours: JSON.stringify(['09:00-12:00', '14:00-17:00']),
    },
  });

  await upsertUserWithProfiles({
    email: 'emily.chen@example.com',
    password: 'password123',
    firstName: 'Emily',
    lastName: 'Chen',
    phone: '+1122334455',
    role: 'DOCTOR',
    doctorProfile: {
      specialization: 'Oncologist',
      bio: 'Dedicated oncologist specializing in breast cancer research and advanced therapies.',
      licenseNumber: 'DOC789012',
      experience: 15,
      consultationFee: 300,
      availableDays: JSON.stringify(['Tuesday', 'Thursday']),
      availableHours: JSON.stringify(['10:00-13:00', '15:00-18:00']),
    },
  });

  await upsertUserWithProfiles({
    email: 'michael.brown@example.com',
    password: 'password123',
    firstName: 'Michael',
    lastName: 'Brown',
    phone: '+1555666777',
    role: 'DOCTOR',
    doctorProfile: {
      specialization: 'Neurologist',
      bio: 'Expert in neurological disorders, with a focus on epilepsy and stroke management.',
      licenseNumber: 'DOC345678',
      experience: 8,
      consultationFee: 200,
      availableDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday']),
      availableHours: JSON.stringify(['08:00-11:00', '13:00-16:00']),
    },
  });

  await upsertUserWithProfiles({
    email: 'jessica.davis@example.com',
    password: 'password123',
    firstName: 'Jessica',
    lastName: 'Davis',
    phone: '+1999888777',
    role: 'DOCTOR',
    doctorProfile: {
      specialization: 'Dermatologist',
      bio: 'Specializing in cosmetic dermatology and treatment of chronic skin conditions.',
      licenseNumber: 'DOC901234',
      experience: 7,
      consultationFee: 180,
      availableDays: JSON.stringify(['Wednesday', 'Friday', 'Saturday']),
      availableHours: JSON.stringify(['11:00-15:00']),
    },
  });

  await upsertUserWithProfiles({
    email: 'david.wilson@example.com',
    password: 'password123',
    firstName: 'David',
    lastName: 'Wilson',
    phone: '+1444333222',
    role: 'DOCTOR',
    doctorProfile: {
      specialization: 'Pediatrician',
      bio: 'Compassionate pediatrician committed to the health and well-being of children.',
      licenseNumber: 'DOC567890',
      experience: 10,
      consultationFee: 160,
      availableDays: JSON.stringify(['Monday', 'Thursday', 'Friday']),
      availableHours: JSON.stringify(['09:00-17:00']),
    },
  });

  // Ensure at least one appointment exists (idempotent-ish)
  const oneDoctor = doctor1;
  const existsAppointment = await prisma.appointment.findFirst({
    where: { patientId: patient.id, doctorId: oneDoctor.id },
  });
  if (!existsAppointment) {
    const start = new Date();
    start.setDate(start.getDate() + 2);
    start.setHours(14, 30, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: oneDoctor.id,
        appointmentDate: start,
        endTime: end,
        status: 'PENDING',
        reason: 'Routine checkup',
        notes: 'Auto-created by seed-safe',
      },
    });
  }

  console.log('Safe seed completed: users, profiles, and an appointment are ensured.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
