import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Tunisian test accounts with realistic data
// Set to true if you explicitly want to seed doctor users. Default: false.
const SEED_DOCTORS = false;

let tunisianUsers = [
  // Doctors
  {
    email: 'dr.amira.ben.salem@chifaacare.tn',
    password: 'Tunis2024!',
    firstName: 'Amira',
    lastName: 'Ben Salem',
    role: 'DOCTOR',
    phone: '+216 98 123 456',
    gender: 'FEMALE',
    dateOfBirth: new Date('1985-03-15'),
    doctorProfile: {
      specialization: 'Oncology',
      bio: 'Spécialiste en oncologie avec 15 ans d\'expérience. Diplômée de la Faculté de Médecine de Tunis.',
      licenseNumber: 'TN-DOC-2008-1234',
      experience: 15,
      consultationFee: 80,
      languages: JSON.stringify(['Arabe', 'Français', 'Anglais']),
      availableDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday']),
      availableHours: JSON.stringify(['09:00-12:00', '14:00-17:00'])
    }
  },
  {
    email: 'dr.mohamed.trabelsi@chifaacare.tn',
    password: 'Tunis2024!',
    firstName: 'Mohamed',
    lastName: 'Trabelsi',
    role: 'DOCTOR',
    phone: '+216 98 234 567',
    gender: 'MALE',
    dateOfBirth: new Date('1980-07-22'),
    doctorProfile: {
      specialization: 'Cardiology',
      bio: 'Cardiologue expérimenté, spécialisé dans les maladies cardiovasculaires. Ancien chef de service à l\'Hôpital Charles Nicolle.',
      licenseNumber: 'TN-DOC-2005-5678',
      experience: 19,
      consultationFee: 100,
      languages: JSON.stringify(['Arabe', 'Français']),
      availableDays: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
      availableHours: JSON.stringify(['10:00-13:00', '15:00-18:00'])
    }
  },
  {
    email: 'dr.leila.gharbi@chifaacare.tn',
    password: 'Tunis2024!',
    firstName: 'Leila',
    lastName: 'Gharbi',
    role: 'DOCTOR',
    phone: '+216 98 345 678',
    gender: 'FEMALE',
    dateOfBirth: new Date('1988-11-10'),
    doctorProfile: {
      specialization: 'Pediatrics',
      bio: 'Pédiatre passionnée par la santé des enfants. Formée à l\'Institut Pasteur de Tunis.',
      licenseNumber: 'TN-DOC-2012-9012',
      experience: 12,
      consultationFee: 70,
      languages: JSON.stringify(['Arabe', 'Français', 'Anglais']),
      availableDays: JSON.stringify(['Tuesday', 'Thursday', 'Saturday']),
      availableHours: JSON.stringify(['08:00-12:00', '14:00-17:00'])
    }
  },
  {
    email: 'dr.karim.bouazizi@chifaacare.tn',
    password: 'Tunis2024!',
    firstName: 'Karim',
    lastName: 'Bouazizi',
    role: 'DOCTOR',
    phone: '+216 98 456 789',
    gender: 'MALE',
    dateOfBirth: new Date('1983-05-18'),
    doctorProfile: {
      specialization: 'Neurology',
      bio: 'Neurologue spécialisé dans les troubles neurologiques complexes. Diplômé de la Faculté de Médecine de Sousse.',
      licenseNumber: 'TN-DOC-2009-3456',
      experience: 15,
      consultationFee: 90,
      languages: JSON.stringify(['Arabe', 'Français', 'Anglais']),
      availableDays: JSON.stringify(['Monday', 'Tuesday', 'Thursday', 'Friday']),
      availableHours: JSON.stringify(['09:00-12:00', '15:00-18:00'])
    }
  },
  {
    email: 'dr.sonia.mansour@chifaacare.tn',
    password: 'Tunis2024!',
    firstName: 'Sonia',
    lastName: 'Mansour',
    role: 'DOCTOR',
    phone: '+216 98 567 890',
    gender: 'FEMALE',
    dateOfBirth: new Date('1990-09-25'),
    doctorProfile: {
      specialization: 'Dermatology',
      bio: 'Dermatologue spécialisée dans les soins de la peau et les traitements esthétiques.',
      licenseNumber: 'TN-DOC-2015-7890',
      experience: 9,
      consultationFee: 75,
      languages: JSON.stringify(['Arabe', 'Français']),
      availableDays: JSON.stringify(['Monday', 'Wednesday', 'Friday', 'Saturday']),
      availableHours: JSON.stringify(['10:00-13:00', '14:00-17:00'])
    }
  },

  // Patients
  {
    email: 'fatma.ben.ali@gmail.com',
    password: 'Patient2024!',
    firstName: 'Fatma',
    lastName: 'Ben Ali',
    role: 'PATIENT',
    phone: '+216 22 123 456',
    gender: 'FEMALE',
    dateOfBirth: new Date('1992-04-12'),
    patientProfile: {
      bloodType: 'A+',
      height: 165,
      weight: 62,
      allergies: JSON.stringify(['Pénicilline']),
      medications: JSON.stringify([])
    }
  },
  {
    email: 'ahmed.hammami@gmail.com',
    password: 'Patient2024!',
    firstName: 'Ahmed',
    lastName: 'Hammami',
    role: 'PATIENT',
    phone: '+216 22 234 567',
    gender: 'MALE',
    dateOfBirth: new Date('1975-08-30'),
    patientProfile: {
      bloodType: 'O+',
      height: 178,
      weight: 85,
      allergies: JSON.stringify([]),
      medications: JSON.stringify(['Metformine'])
    }
  },
  {
    email: 'nadia.jebali@gmail.com',
    password: 'Patient2024!',
    firstName: 'Nadia',
    lastName: 'Jebali',
    role: 'PATIENT',
    phone: '+216 22 345 678',
    gender: 'FEMALE',
    dateOfBirth: new Date('1988-12-05'),
    patientProfile: {
      bloodType: 'B+',
      height: 160,
      weight: 58,
      allergies: JSON.stringify(['Aspirine']),
      medications: JSON.stringify([])
    }
  },

  // Clinic Staff
  {
    email: 'salma.khelifi@clinic-tunis.tn',
    password: 'Clinic2024!',
    firstName: 'Salma',
    lastName: 'Khelifi',
    role: 'CLINIC',
    phone: '+216 71 123 456',
    gender: 'FEMALE',
    dateOfBirth: new Date('1995-06-20')
  },

  // Admin
  {
    email: 'admin.chifaacare@chifaacare.tn',
    password: 'Admin2024!',
    firstName: 'Administrateur',
    lastName: 'ChifaaCare',
    role: 'ADMIN',
    phone: '+216 71 234 567',
    gender: 'MALE',
    dateOfBirth: new Date('1985-01-01')
  }
];

async function seedTunisianUsers() {
  console.log('🇹🇳 Seeding Tunisian users...\n');

  try {
    // If SEED_DOCTORS is false, filter out doctor entries so the app only uses doctors from the DB
    if (!SEED_DOCTORS) {
      tunisianUsers = tunisianUsers.filter((u) => u.role !== 'DOCTOR');
      console.log('ℹ️  SEED_DOCTORS is false - skipping doctor user seeds.');
    }
    for (const userData of tunisianUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user with profile
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          phone: userData.phone,
          gender: userData.gender,
          dateOfBirth: userData.dateOfBirth,
          isEmailVerified: true,
          isActive: true,
          ...(userData.doctorProfile && {
            doctorProfile: {
              create: userData.doctorProfile
            }
          }),
          ...(userData.patientProfile && {
            patientProfile: {
              create: userData.patientProfile
            }
          })
        }
      });

      // Assign role in RBAC system
      const role = await prisma.role.findUnique({
        where: { name: userData.role }
      });

      if (role) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id
          }
        });
      }

      console.log(`✅ Created ${userData.role}: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    }

    console.log('\n🎉 Tunisian users seeded successfully!\n');
    console.log('📋 Login Credentials:\n');
    console.log('DOCTORS:');
    console.log('  dr.amira.ben.salem@chifaacare.tn / Tunis2024!');
    console.log('  dr.mohamed.trabelsi@chifaacare.tn / Tunis2024!');
    console.log('  dr.leila.gharbi@chifaacare.tn / Tunis2024!');
    console.log('  dr.karim.bouazizi@chifaacare.tn / Tunis2024!');
    console.log('  dr.sonia.mansour@chifaacare.tn / Tunis2024!\n');
    console.log('PATIENTS:');
    console.log('  fatma.ben.ali@gmail.com / Patient2024!');
    console.log('  ahmed.hammami@gmail.com / Patient2024!');
    console.log('  nadia.jebali@gmail.com / Patient2024!\n');
    console.log('CLINIC STAFF:');
    console.log('  salma.khelifi@clinic-tunis.tn / Clinic2024!\n');
    console.log('ADMIN:');
    console.log('  admin.chifaacare@chifaacare.tn / Admin2024!\n');

  } catch (error) {
    console.error('❌ Error seeding Tunisian users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedTunisianUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedTunisianUsers };
