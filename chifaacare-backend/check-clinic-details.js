const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkClinicDetails() {
  try {
    console.log('🔍 Checking clinic account details...\n');
    
    // Get clinic users
    const clinicUsers = await prisma.user.findMany({
      where: {
        role: 'CLINIC'
      }
    });
    
    console.log(`Found ${clinicUsers.length} users with role CLINIC:\n`);
    
    for (const user of clinicUsers) {
      console.log('════════════════════════════════════════');
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
      console.log(`🎭 Role in DB: ${user.role}`);
      console.log(`🏥 Clinic Role: ${user.clinicRole || 'Not Set'}`);
      console.log(`🆔 ID: ${user.id}`);
      
      // Test password
      const passwordMatches = await bcrypt.compare('clinic123', user.password);
      console.log(`🔑 Password 'clinic123': ${passwordMatches ? '✅ CORRECT' : '❌ WRONG'}`);
      console.log('');
    }
    
    // Also check what roles exist in the database
    console.log('═══════════════════════════════════════');
    console.log('📊 All unique roles in database:');
    const allUsers = await prisma.user.findMany({
      select: { role: true }
    });
    const uniqueRoles = [...new Set(allUsers.map(u => u.role))];
    console.log(uniqueRoles);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkClinicDetails();
