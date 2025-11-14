import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List of valid Tunisian users we want to keep
const validEmails = [
  // Patients
  'fatma.ben.ali@gmail.com',
  'ahmed.hammami@gmail.com',
  'nadia.jebali@gmail.com',
  
  // Doctors
  'dr.amira.ben.salem@chifaacare.tn',
  'dr.mohamed.trabelsi@chifaacare.tn',
  'dr.leila.gharbi@chifaacare.tn',
  'dr.karim.bouazizi@chifaacare.tn',
  'dr.sonia.mansour@chifaacare.tn',
  
  // Clinic
  'salma.khelifi@clinic-tunis.tn',
  
  // Admin
  'admin.chifaacare@chifaacare.tn'
];

async function cleanupTestUsers() {
  console.log('🧹 Cleaning up test users from database...\n');

  try {
    // Find all users that are NOT in our valid list
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          notIn: validEmails
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (testUsers.length === 0) {
      console.log('✅ No test users found. Database is clean!');
      return;
    }

    console.log(`Found ${testUsers.length} test users to remove:\n`);
    testUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) [${user.role}]`);
    });

    console.log('\n🗑️  Deleting test users and their related data...\n');

    const testUserIds = testUsers.map(u => u.id);

    // Delete related data first (due to foreign key constraints)
    
    // 1. Delete messages
    const deletedMessages = await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: { in: testUserIds } },
          { recipientId: { in: testUserIds } }
        ]
      }
    });
    console.log(`  ✓ Deleted ${deletedMessages.count} messages`);

    // 2. Delete appointments
    const deletedAppointments = await prisma.appointment.deleteMany({
      where: {
        OR: [
          { patientId: { in: testUserIds } },
          { doctorId: { in: testUserIds } }
        ]
      }
    });
    console.log(`  ✓ Deleted ${deletedAppointments.count} appointments`);

    // 3. Delete user roles
    const deletedUserRoles = await prisma.userRole.deleteMany({
      where: {
        userId: { in: testUserIds }
      }
    });
    console.log(`  ✓ Deleted ${deletedUserRoles.count} user role assignments`);

    // 4. Delete doctor profiles
    const deletedDoctorProfiles = await prisma.doctorProfile.deleteMany({
      where: {
        userId: { in: testUserIds }
      }
    });
    console.log(`  ✓ Deleted ${deletedDoctorProfiles.count} doctor profiles`);

    // 5. Delete patient profiles
    const deletedPatientProfiles = await prisma.patientProfile.deleteMany({
      where: {
        userId: { in: testUserIds }
      }
    });
    console.log(`  ✓ Deleted ${deletedPatientProfiles.count} patient profiles`);

    // 6. Finally, delete the users
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: { in: testUserIds }
      }
    });
    console.log(`  ✓ Deleted ${deletedUsers.count} test users`);

    console.log('\n🎉 Cleanup completed successfully!\n');
    console.log('✅ Only Tunisian users remain in the database:');
    console.log('   Patients: Fatma Ben Ali, Ahmed Hammami, Nadia Jebali');
    console.log('   Doctors: Dr. Amira Ben Salem, Dr. Mohamed Trabelsi, Dr. Leila Gharbi,');
    console.log('            Dr. Karim Bouazizi, Dr. Sonia Mansour');
    console.log('   Clinic: Salma Khelifi');
    console.log('   Admin: Administrateur ChifaaCare\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  cleanupTestUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { cleanupTestUsers };
