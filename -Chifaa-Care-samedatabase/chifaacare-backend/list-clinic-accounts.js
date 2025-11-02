const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listClinicAccounts() {
  try {
    console.log('🏥 Fetching all CLINIC accounts...\n');
    
    const clinicUsers = await prisma.user.findMany({
      where: {
        role: 'CLINIC'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        clinicRole: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    if (clinicUsers.length === 0) {
      console.log('❌ No clinic accounts found.');
    } else {
      console.log(`✅ Found ${clinicUsers.length} CLINIC account(s):\n`);
      
      clinicUsers.forEach((user, index) => {
        console.log(`════════════ Clinic Account ${index + 1} ════════════`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
        console.log(`🎭 Role: ${user.role}`);
        console.log(`🏥 Clinic Role: ${user.clinicRole || 'Not Set'}`);
        console.log(`✅ Active: ${user.isActive}`);
        console.log(`📨 Verified: ${user.isEmailVerified}`);
        console.log(`🆔 ID: ${user.id}`);
        console.log(`📅 Created: ${user.createdAt.toLocaleString()}`);
        console.log('');
      });
      
      console.log('═══════════════════════════════════════');
      console.log('🔑 DEFAULT PASSWORD: clinic123');
      console.log('═══════════════════════════════════════\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listClinicAccounts();
