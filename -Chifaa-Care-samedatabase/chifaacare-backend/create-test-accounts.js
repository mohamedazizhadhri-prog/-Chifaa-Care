const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestAccounts() {
  try {
    console.log('👥 Creating test accounts...');
    
    const accounts = [
      {
        email: 'admin@chifaacare.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        clinicRole: 'ADMIN'
      },
      // NOTE: Removed static doctor account to ensure site uses doctors from the database only.
      {
        email: 'patient@chifaacare.com',
        password: 'patient123',
        firstName: 'Fatima',
        lastName: 'Al-Zahra',
        role: 'PATIENT'
      },
      {
        email: 'clinic@chifaacare.com',
        password: 'clinic123',
        firstName: 'ChifaaCare',
        lastName: 'Clinic',
        role: 'CLINIC',
        clinicRole: 'ADMIN'
      }
    ];
    
    console.log('📋 Test Accounts Created:');
    console.log('========================');
    
    for (const account of accounts) {
      try {
        const hashedPassword = await bcrypt.hash(account.password, 10);
        
        const user = await prisma.user.create({
          data: {
            email: account.email,
            password: hashedPassword,
            firstName: account.firstName,
            lastName: account.lastName,
            role: account.role,
            clinicRole: account.clinicRole,
            isEmailVerified: true,
            isActive: true,
          }
        });
        
        console.log(`✅ ${account.role}: ${account.email} / ${account.password}`);
        
      } catch (error) {
        if (error.message.includes('Unique constraint')) {
          console.log(`⚠️  ${account.role}: ${account.email} / ${account.password} (already exists)`);
        } else {
          console.log(`❌ ${account.role}: ${account.email} - Error: ${error.message}`);
        }
      }
    }
    
    console.log('\n🔑 Login Credentials Summary:');
    console.log('=============================');
  console.log('🏥 CLINIC ADMIN: clinic@chifaacare.com / clinic123');
  console.log('👤 PATIENT: patient@chifaacare.com / patient123');
  console.log('⚙️ SYSTEM ADMIN: admin@chifaacare.com / admin123');
    
  } catch (error) {
    console.error('❌ Error creating test accounts:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestAccounts();
