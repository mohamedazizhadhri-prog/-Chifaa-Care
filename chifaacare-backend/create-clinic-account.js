const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createClinicAccount() {
  try {
    console.log('🏥 Creating clinic account...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('clinic123', 10);
    
    // Create clinic user
    const clinicUser = await prisma.user.create({
      data: {
        email: 'clinic@chifaacare.com',
        password: hashedPassword,
        firstName: 'ChifaaCare',
        lastName: 'Clinic',
        phone: '+218 21 123 4567',
        role: 'CLINIC',
        clinicRole: 'ADMIN',
        isEmailVerified: true,
        isActive: true,
      }
    });
    
    console.log('✅ Clinic account created successfully!');
    console.log('📧 Email: clinic@chifaacare.com');
    console.log('🔑 Password: clinic123');
    console.log('👤 Role: CLINIC ADMIN');
    console.log('🆔 User ID:', clinicUser.id);
    
    // Create a sample clinic
    const clinic = await prisma.clinic.create({
      data: {
        name: 'ChifaaCare Medical Center',
        description: 'Leading healthcare provider in Libya',
        address: '123 Healthcare Street',
        city: 'Tripoli',
        state: 'Tripoli',
        country: 'Libya',
        postalCode: '11000',
        phone: '+218 21 123 4567',
        email: 'clinic@chifaacare.com',
        status: 'ACTIVE',
        onboardingStep: 'COMPLETED',
      }
    });
    
    console.log('🏥 Clinic created:', clinic.name);
    console.log('🆔 Clinic ID:', clinic.id);
    
    // Update user with clinic ID
    await prisma.user.update({
      where: { id: clinicUser.id },
      data: { clinicId: clinic.id }
    });
    
    console.log('🔗 User linked to clinic');
    
  } catch (error) {
    console.error('❌ Error creating clinic account:', error.message);
    
    if (error.message.includes('Unique constraint')) {
      console.log('💡 Account already exists. Here are the login credentials:');
      console.log('📧 Email: clinic@chifaacare.com');
      console.log('🔑 Password: clinic123');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createClinicAccount();
