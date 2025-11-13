const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixClinicRole() {
  try {
    console.log('🔧 Fixing clinic user roles...\n');
    
    // Find all users that should be clinics but have wrong role format
    const usersToFix = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'clinic' },
          { role: 'Clinic' },
          { 
            AND: [
              { clinicId: { not: null } },
              { role: { not: 'CLINIC' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    });

    if (usersToFix.length === 0) {
      console.log('✅ No clinic users need fixing. All roles are correct!');
      
      // Show current clinic users
      const correctUsers = await prisma.user.findMany({
        where: { role: 'CLINIC' },
        select: {
          email: true,
          role: true,
          firstName: true,
          lastName: true
        }
      });
      
      if (correctUsers.length > 0) {
        console.log(`\n✅ Found ${correctUsers.length} clinic user(s) with correct role:`);
        correctUsers.forEach(user => {
          console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
        });
      } else {
        console.log('\n⚠️  No clinic users found. Create one with: node create-clinic-user.js');
      }
      
      return;
    }

    console.log(`Found ${usersToFix.length} user(s) to fix:\n`);
    
    for (const user of usersToFix) {
      console.log(`Fixing: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`  Old role: ${user.role}`);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'CLINIC' }
      });
      
      console.log(`  New role: CLINIC ✅\n`);
    }

    console.log('✅ All clinic user roles have been fixed to "CLINIC"');
    console.log('\nYou can now login with these accounts:');
    
    const fixedUsers = await prisma.user.findMany({
      where: {
        id: { in: usersToFix.map(u => u.id) }
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    
    fixedUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role} ✅\n`);
    });

  } catch (error) {
    console.error('❌ Error fixing roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixClinicRole();
