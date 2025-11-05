const { PrismaClient } = require('@prisma/client');

async function checkDoctors() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking for doctors in the database...');
    
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        doctorProfile: {
          select: {
            specialization: true,
            consultationFee: true
          }
        }
      }
    });

    if (doctors.length > 0) {
      console.log('✅ Found', doctors.length, 'doctors in the database:');
      console.table(doctors.map(d => ({
        Name: `${d.firstName} ${d.lastName}`,
        Email: d.email,
        Specialization: d.doctorProfile?.specialization || 'N/A',
        'Consultation Fee': d.doctorProfile?.consultationFee || 'N/A'
      })));
    } else {
      console.log('❌ No doctors found in the database.');
    }
  } catch (error) {
    console.error('❌ Error checking doctors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDoctors();
