const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function createDoctor(doctorData) {
  const hashedPassword = await hashPassword('Doctor@123'); // Default password for all demo doctors
  
  return await prisma.user.create({
    data: {
      email: doctorData.email,
      password: hashedPassword,
      firstName: doctorData.firstName,
      lastName: doctorData.lastName,
      phone: doctorData.phone,
      role: 'DOCTOR',
      isEmailVerified: true,
      doctorProfile: {
        create: {
          specialization: doctorData.specialization,
          bio: doctorData.bio,
          licenseNumber: `TN-${Math.floor(10000 + Math.random() * 90000)}`,
          experience: doctorData.experience,
          consultationFee: doctorData.consultationFee,
          availableDays: JSON.stringify(["Monday", "Wednesday", "Friday"]),
          availableHours: JSON.stringify(["09:00-12:00", "14:00-17:00"]),
          languages: JSON.stringify(["Arabic", "French", "English"]),
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
      doctorProfile: {
        include: {
          education: true
        }
      }
    }
  });
}

const tunisianDoctors = [
  {
    email: 'dr.ahmed.benali@example.com',
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    phone: '+21620123456',
    specialization: 'Cardiology',
    bio: 'Experienced cardiologist with over 10 years of practice in Tunisian hospitals. Specializes in non-invasive cardiology and preventive care.',
    experience: 12,
    consultationFee: 80,
    degree: 'MD',
    institution: 'Faculty of Medicine of Tunis'
  },
  {
    email: 'dr.salma.trabelsi@example.com',
    firstName: 'Salma',
    lastName: 'Trabelsi',
    phone: '+216501234567',
    specialization: 'Pediatrics',
    bio: 'Pediatrician dedicated to providing comprehensive healthcare for children from birth through adolescence. Fluent in Arabic, French, and English.',
    experience: 8,
    consultationFee: 70,
    degree: 'MD',
    institution: 'Faculty of Medicine of Sousse'
  },
  {
    email: 'dr.omar.gharsalli@example.com',
    firstName: 'Omar',
    lastName: 'Gharsalli',
    phone: '+21698123456',
    specialization: 'Orthopedics',
    bio: 'Orthopedic surgeon specializing in sports medicine and joint replacement. Committed to helping patients regain mobility and return to active lifestyles.',
    experience: 15,
    consultationFee: 100,
    degree: 'MD, PhD',
    institution: 'Faculty of Medicine of Sfax'
  }
];

async function main() {
  console.log('🌱 Seeding Tunisian doctors...');
  
  try {
    // Check if any of the doctors already exist
    const existingDoctors = await prisma.user.findMany({
      where: {
        email: {
          in: tunisianDoctors.map(doc => doc.email)
        }
      },
      select: {
        email: true
      }
    });

    if (existingDoctors.length > 0) {
      console.log('⚠️  Some doctors already exist in the database:');
      existingDoctors.forEach(doc => console.log(`- ${doc.email}`));
      console.log('Skipping existing doctors...');
      
      // Filter out existing doctors
      const newDoctors = tunisianDoctors.filter(
        doc => !existingDoctors.some(existing => existing.email === doc.email)
      );
      
      if (newDoctors.length === 0) {
        console.log('✅ All doctors already exist in the database.');
        return;
      }
      
      console.log(`\n🌱 Adding ${newDoctors.length} new doctors...`);
      
      for (const doctor of newDoctors) {
        const createdDoctor = await createDoctor(doctor);
        console.log(`✅ Added Dr. ${createdDoctor.firstName} ${createdDoctor.lastName} (${doctor.specialization})`);
      }
    } else {
      console.log('No existing doctors found. Adding all Tunisian doctors...\n');
      
      for (const doctor of tunisianDoctors) {
        const createdDoctor = await createDoctor(doctor);
        console.log(`✅ Added Dr. ${createdDoctor.firstName} ${createdDoctor.lastName} (${doctor.specialization})`);
      }
    }
    
    console.log('\n🎉 Successfully seeded Tunisian doctors!');
    console.log('\n📝 Login credentials for all doctors:');
    console.log('   Email: [doctor-email]');
    console.log('   Password: Doctor@123');
    console.log('\n🔐 Please change the password after first login.');
    
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
