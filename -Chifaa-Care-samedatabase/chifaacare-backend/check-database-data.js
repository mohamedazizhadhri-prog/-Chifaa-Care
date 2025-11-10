const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking database data...\n');
    
    // Count users by role
    const doctorCount = await prisma.user.count({ where: { role: 'DOCTOR' } });
    const patientCount = await prisma.user.count({ where: { role: 'PATIENT' } });
    const clinicCount = await prisma.user.count({ where: { role: 'CLINIC' } });
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    
    console.log('📊 Database Statistics:');
    console.log('=======================');
    console.log(`👨‍⚕️  Doctors: ${doctorCount}`);
    console.log(`🏥 Patients: ${patientCount}`);
    console.log(`🏢 Clinics: ${clinicCount}`);
    console.log(`⚙️  Admins: ${adminCount}`);
    console.log(`📋 Total Users: ${doctorCount + patientCount + clinicCount + adminCount}\n`);
    
    // List doctors if any exist
    if (doctorCount > 0) {
      console.log('👨‍⚕️  Doctors in Database:');
      console.log('========================');
      const doctors = await prisma.user.findMany({
        where: { role: 'DOCTOR' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          doctorProfile: {
            select: {
              specialization: true
            }
          }
        },
        take: 10
      });
      
      doctors.forEach((doctor, index) => {
        console.log(`${index + 1}. Dr. ${doctor.firstName} ${doctor.lastName}`);
        console.log(`   Email: ${doctor.email}`);
        console.log(`   Specialization: ${doctor.doctorProfile?.specialization || 'Not set'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  NO DOCTORS FOUND IN DATABASE!');
      console.log('   Run: npm run seed:safe');
      console.log('   Or: node create-clinics.js\n');
    }
    
    // List patients if any exist
    if (patientCount > 0) {
      console.log('🏥 Patients in Database:');
      console.log('========================');
      const patients = await prisma.user.findMany({
        where: { role: 'PATIENT' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        },
        take: 5
      });
      
      patients.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.firstName} ${patient.lastName} (${patient.email})`);
      });
      console.log('');
    } else {
      console.log('⚠️  NO PATIENTS FOUND IN DATABASE!\n');
    }
    
    // Check database connection
    console.log('🔌 Database Connection:');
    console.log('=======================');
    console.log(`URL: ${process.env.DATABASE_URL ? 'Configured ✅' : 'Not configured ❌'}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.error('\n💡 Make sure:');
    console.error('1. Database is running');
    console.error('2. DATABASE_URL in .env is correct');
    console.error('3. Run: npx prisma migrate dev');
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseData();
