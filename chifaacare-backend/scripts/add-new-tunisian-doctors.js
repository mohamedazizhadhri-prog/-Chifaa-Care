const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function createNewDoctor(doctorData) {
  const hashedPassword = await hashPassword('Tunisia@2023');
  
  // Generate a unique email based on name and timestamp
  const timestamp = Date.now();
  const email = `${doctorData.firstName.toLowerCase()}.${doctorData.lastName.toLowerCase().replace(' ', '')}${timestamp}@tunisiacare.com`;
  
  return await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      firstName: doctorData.firstName,
      lastName: doctorData.lastName,
      phone: `+216${Math.floor(20000000 + Math.random() * 80000000)}`, // Random Tunisian number
      role: 'DOCTOR',
      isEmailVerified: true,
      doctorProfile: {
        create: {
          specialization: doctorData.specialization,
          bio: doctorData.bio,
          licenseNumber: `TN-${Math.floor(100000 + Math.random() * 900000)}`,
          experience: doctorData.experience,
          consultationFee: doctorData.consultationFee,
          availableDays: JSON.stringify(["Monday", "Tuesday", "Thursday"]),
          availableHours: JSON.stringify(["08:00-12:00", "14:00-18:00"]),
          languages: JSON.stringify(["Arabic", "French"]),
          education: {
            create: {
              degree: doctorData.degree,
              institution: doctorData.institution,
              fieldOfStudy: doctorData.specialization,
              startYear: new Date().getFullYear() - doctorData.experience - 5,
              endYear: new Date().getFullYear() - doctorData.experience,
              description: `Graduated from ${doctorData.institution} with specialization in ${doctorData.specialization}`
            }
          }
        }
      }
    },
    include: {
      doctorProfile: true
    }
  });
}

const newTunisianDoctors = [
  {
    firstName: 'Nadia',
    lastName: 'Masmoudi',
    specialization: 'Dermatology',
    bio: 'Dermatologist with extensive experience in treating skin conditions and cosmetic dermatology. Fluent in Arabic and French.',
    experience: 9,
    consultationFee: 90,
    degree: 'MD',
    institution: 'Faculty of Medicine of Tunis'
  },
  {
    firstName: 'Karim',
    lastName: 'Ben Ammar',
    specialization: 'Neurology',
    bio: 'Neurologist specialized in treating disorders of the nervous system. Experienced in both clinical and research settings.',
    experience: 11,
    consultationFee: 110,
    degree: 'MD, PhD',
    institution: 'Faculty of Medicine of Sfax'
  },
  {
    firstName: 'Leila',
    lastName: 'Gharbi',
    specialization: 'Gynecology',
    bio: 'Gynecologist providing comprehensive women\'s health services with a focus on preventive care and patient education.',
    experience: 7,
    consultationFee: 85,
    degree: 'MD',
    institution: 'Faculty of Medicine of Monastir'
  }
];

async function main() {
  console.log('🌱 Adding new Tunisian doctors...');
  
  try {
    const results = [];
    
    for (const doctor of newTunisianDoctors) {
      const createdDoctor = await createNewDoctor(doctor);
      results.push({
        name: `${createdDoctor.firstName} ${createdDoctor.lastName}`,
        email: createdDoctor.email,
        specialization: createdDoctor.doctorProfile.specialization,
        password: 'Tunisia@2023' // This is the default password
      });
      console.log(`✅ Added ${createdDoctor.firstName} ${createdDoctor.lastName}`);
    }
    
    console.log('\n🎉 Successfully added new Tunisian doctors!');
    console.log('\n📝 Login credentials:');
    console.table(results);
    
  } catch (error) {
    console.error('❌ Error adding doctors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
