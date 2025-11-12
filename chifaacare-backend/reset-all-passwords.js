const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Define new passwords for each user
const userPasswords = [
  { email: 'sarah.jlassi@example.com', password: 'Sarah@123', name: 'Ameni Jlassi' },
  { email: 'doctor@chifaacare.com', password: 'Doctor@123', name: 'Dr. Ahmed Ben Ali' },
  { email: 'patient@chifaacare.com', password: 'Patient@123', name: 'Fatima Al-Zahra' },
  { email: 'dr.garcia@chifaacare.com', password: 'Garcia@123', name: 'Maria Garcia' },
  { email: 'zakryaouchani@example.com', password: 'Zakrya@123', name: 'Zakrya Ouchani' },
  { email: 'clinic@chifaacare.com', password: 'Clinic@123', name: 'ChifaaCare Clinic' },
  { email: 'admin@chifaacare.com', password: 'Admin@123', name: 'Admin User' },
  { email: 'mouna1967@gmail.com', password: 'Mouna@123', name: 'Mouna Nourdin' },
  { email: 'amine.chalfouh@example.com', password: 'Amine@123', name: 'Amine Ben Chalfouh' },
  { email: 'testclinic@chifaacare.com', password: 'TestClinic@123', name: 'Test Clinic' },
  { email: 'tassnim.chaben@example.com', password: 'Tassnim@123', name: 'Tassnim Ben Chaben' },
  { email: 'admin222@chifaacare.com', password: 'Admin222@123', name: 'Jassmine2 Admin' },
  { email: 'yassinroyal@gmail.com', password: 'Yassin@123', name: 'Yassin Ferchichi' },
  { email: 'patient@example.com', password: 'Patient2@123', name: 'John Doe' },
  { email: 'samira.khla@example.com', password: 'Samira@123', name: 'Samira Lkhla' },
  { email: 'louaychokri124@gmail.com', password: 'Louay@123', name: 'Louay Chokri' },
  { email: 'kamel.farzit@example.com', password: 'Kamel@123', name: 'Kamel Farzit' },
  { email: 'ranya@yakhlef.com', password: 'Ranya@123', name: 'Ranya Yakhlef' },
  { email: 'admin.chifaacare@gmail.com', password: 'AdminMain@123', name: 'Admin User (Main)' },
];

async function resetAllPasswords() {
  console.log('🔐 Resetting passwords for all users...\n');
  console.log('=====================================\n');

  let successCount = 0;
  let failCount = 0;

  for (const userData of userPasswords) {
    try {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Update the user's password
      await prisma.user.update({
        where: { email: userData.email },
        data: { password: hashedPassword }
      });

      console.log(`✅ ${userData.name}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}\n`);
      successCount++;
    } catch (error) {
      console.log(`❌ Failed to reset password for ${userData.email}`);
      console.log(`   Error: ${error.message}\n`);
      failCount++;
    }
  }

  console.log('=====================================');
  console.log(`✅ Successfully reset: ${successCount} accounts`);
  console.log(`❌ Failed: ${failCount} accounts`);
  console.log('=====================================\n');

  // Print summary table
  console.log('📋 LOGIN CREDENTIALS SUMMARY:');
  console.log('=====================================\n');
  
  userPasswords.forEach((user) => {
    console.log(`${user.name}`);
    console.log(`📧 ${user.email}`);
    console.log(`🔑 ${user.password}`);
    console.log('-------------------------------------');
  });
}

resetAllPasswords()
  .catch((error) => {
    console.error('❌ Error resetting passwords:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
