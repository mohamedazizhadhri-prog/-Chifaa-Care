const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createClinicUser() {
  try {
    const email = 'clinic@chifaacare.com';
    const password = 'Clinic123!';
    
    console.log('🏥 Creating clinic user...\n');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('❌ User already exists with this email:', email);
      console.log('If you want to fix the role, run: node fix-clinic-role.js');
      return;
    }

    // Check if clinic already exists with this email
    const existingClinic = await prisma.clinic.findUnique({
      where: { email }
    });

    let clinic;
    if (existingClinic) {
      console.log('✅ Using existing clinic:', existingClinic.name);
      clinic = existingClinic;
    } else {
      // Create clinic first
      console.log('Creating new clinic...');
      clinic = await prisma.clinic.create({
        data: {
          name: 'Chifaa Care Clinic',
          description: 'Premier healthcare facility',
          address: '123 Medical Center Drive',
          city: 'Tunis',
          state: 'Tunis',
          country: 'Tunisia',
          postalCode: '1000',
          phone: '+216-12-345-678',
          email: email,
          status: 'ACTIVE',
          onboardingStep: 'COMPLETED'
        }
      });
      console.log('✅ Clinic created:', clinic.name);
    }

    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    console.log('Creating user account...');
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        firstName: 'Clinic',
        lastName: 'Admin',
        phone: '+216-12-345-678',
        role: 'CLINIC', // MUST be uppercase!
        clinicId: clinic.id,
        clinicRole: 'ADMIN',
        isActive: true,
        isEmailVerified: true
      }
    });

    console.log('\n✅ Clinic user created successfully!\n');
    console.log('='.repeat(50));
    console.log('LOGIN CREDENTIALS');
    console.log('='.repeat(50));
    console.log('Email:   ', email);
    console.log('Password:', password);
    console.log('Role:    ', user.role);
    console.log('Clinic:  ', clinic.name);
    console.log('='.repeat(50));
    console.log('\n📝 IMPORTANT: Save these credentials!\n');
    console.log('Now you can login at: http://localhost:4200');
    console.log('You should be redirected to: /clinic/dashboard\n');

  } catch (error) {
    console.error('❌ Error creating clinic user:', error);
    console.error('\nMake sure:');
    console.error('1. Backend is running');
    console.error('2. Database is accessible');
    console.error('3. .env file has correct DATABASE_URL');
  } finally {
    await prisma.$disconnect();
  }
}

createClinicUser();
