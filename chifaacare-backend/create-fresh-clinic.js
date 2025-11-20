const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createFreshClinic() {
  try {
    console.log('🏥 Creating fresh clinic account...\n');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('clinic123', 10);
    
    // Create clinic user
    const clinicUser = await prisma.user.create({
      data: {
        email: 'testclinic@chifaacare.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Clinic',
        phone: '+218 92 555 1234',
        role: 'CLINIC',
        clinicRole: 'ADMIN',
        isEmailVerified: true,
        isActive: true,
      }
    });
    
    console.log('✅ NEW Clinic account created successfully!\n');
    console.log('════════════════════════════════════════');
    console.log('📧 Email: testclinic@chifaacare.com');
    console.log('🔑 Password: clinic123');
    console.log('👤 Name: Test Clinic');
    console.log('🎭 Role: CLINIC');
    console.log('🏥 Clinic Role: ADMIN');
    console.log('✅ Status: Active & Verified');
    console.log('🆔 User ID:', clinicUser.id);
    console.log('════════════════════════════════════════\n');
    
  } catch (error) {
    if (error.message.includes('Unique constraint')) {
      console.log('💡 Account already exists! Here are the credentials:\n');
      console.log('════════════════════════════════════════');
      console.log('📧 Email: testclinic@chifaacare.com');
      console.log('🔑 Password: clinic123');
      console.log('════════════════════════════════════════\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createFreshClinic();
