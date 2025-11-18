const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetClinicPassword() {
  try {
    console.log('🔄 Resetting clinic account passwords...\n');
    
    const newPassword = 'clinic123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update all clinic accounts
    const result = await prisma.user.updateMany({
      where: {
        role: 'CLINIC'
      },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
        isActive: true
      }
    });
    
    console.log(`✅ Updated ${result.count} clinic account(s)\n`);
    
    // List all clinic accounts
    const clinicUsers = await prisma.user.findMany({
      where: { role: 'CLINIC' },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });
    
    console.log('═══════════════════════════════════════');
    console.log('✅ CLINIC ACCOUNTS - ALL RESET TO:');
    console.log('🔑 Password: clinic123');
    console.log('═══════════════════════════════════════\n');
    
    clinicUsers.forEach((user, index) => {
      console.log(`${index + 1}. 📧 ${user.email}`);
      console.log(`   👤 ${user.firstName} ${user.lastName}`);
      console.log(`   ✅ Active: ${user.isActive}\n`);
    });
    
    console.log('═══════════════════════════════════════');
    console.log('🎯 LOGIN URL: http://localhost:4200');
    console.log('🔑 PASSWORD FOR ALL: clinic123');
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetClinicPassword();
