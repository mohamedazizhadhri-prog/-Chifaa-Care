const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClinicUser() {
  try {
    console.log('🔍 Checking for clinic users in database...\n');
    
    // Find all users with CLINIC role
    const clinicUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'CLINIC' },
          { role: 'clinic' },
          { role: 'Clinic' },
          { clinicId: { not: null } }
        ]
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        clinicId: true,
        clinicRole: true,
        isActive: true,
        createdAt: true
      }
    });

    if (clinicUsers.length === 0) {
      console.log('❌ No clinic users found in database!');
      console.log('\nYou need to create a clinic user. Run: node create-clinic-user.js');
      return;
    }

    console.log(`✅ Found ${clinicUsers.length} clinic user(s):\n`);
    
    clinicUsers.forEach((user, index) => {
      console.log(`--- User ${index + 1} ---`);
      console.log('Email:', user.email);
      console.log('Name:', `${user.firstName} ${user.lastName}`);
      console.log('Role in DB:', user.role);
      console.log('Role Type:', typeof user.role);
      console.log('Clinic ID:', user.clinicId || 'None');
      console.log('Clinic Role:', user.clinicRole || 'None');
      console.log('Is Active:', user.isActive);
      console.log('Created:', user.createdAt);
      
      // Check if role is correct format
      if (user.role === 'CLINIC') {
        console.log('✅ Role format is CORRECT (CLINIC in uppercase)');
      } else {
        console.log('❌ Role format is WRONG. Current:', user.role);
        console.log('   Should be: CLINIC (uppercase)');
        console.log('   Run: node fix-clinic-role.js to fix this');
      }
      console.log('');
    });

    // Also check if there are any clinics in the Clinic table
    const clinics = await prisma.clinic.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    });

    if (clinics.length > 0) {
      console.log(`\n📋 Found ${clinics.length} clinic(s) in Clinic table:`);
      clinics.forEach((clinic, index) => {
        console.log(`\n--- Clinic ${index + 1} ---`);
        console.log('Name:', clinic.name);
        console.log('Email:', clinic.email);
        console.log('Status:', clinic.status);
        console.log('ID:', clinic.id);
      });
    } else {
      console.log('\n⚠️  No clinics found in Clinic table');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClinicUser();
