const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAppointments() {
  try {
    console.log('🔍 Fetching all appointments...\n');
    
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });

    if (appointments.length === 0) {
      console.log('✅ No appointments found in the database.\n');
      console.log('This is good if you\'re testing fresh bookings!\n');
      return;
    }

    console.log(`📊 Found ${appointments.length} appointment(s):\n`);
    console.log('='.repeat(100));

    appointments.forEach((apt, index) => {
      const start = new Date(apt.appointmentDate);
      const end = new Date(apt.endTime);
      const now = new Date();
      const isPast = start < now;
      const duration = Math.round((end - start) / (1000 * 60)); // minutes

      console.log(`\n${index + 1}. ID: ${apt.id}`);
      console.log(`   Patient: ${apt.patient.firstName} ${apt.patient.lastName} (${apt.patient.email})`);
      console.log(`   Doctor: ${apt.doctor.firstName} ${apt.doctor.lastName} (${apt.doctor.email})`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Start: ${start.toLocaleString()}`);
      console.log(`   End: ${end.toLocaleString()}`);
      console.log(`   Duration: ${duration} minutes`);
      console.log(`   Reason: ${apt.reason || 'N/A'}`);
      console.log(`   ${isPast ? '⏰ PAST' : '📅 UPCOMING'}`);
      console.log('   ' + '-'.repeat(95));
    });

    console.log('\n' + '='.repeat(100));
    
    // Show statistics
    const pending = appointments.filter(a => a.status === 'PENDING').length;
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
    const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;
    const completed = appointments.filter(a => a.status === 'COMPLETED').length;

    console.log('\n📈 Statistics:');
    console.log(`   Pending: ${pending}`);
    console.log(`   Confirmed: ${confirmed}`);
    console.log(`   Cancelled: ${cancelled}`);
    console.log(`   Completed: ${completed}`);
    
    // Check for potential conflicts
    console.log('\n🔍 Checking for time conflicts...\n');
    let conflictCount = 0;
    
    for (let i = 0; i < appointments.length; i++) {
      for (let j = i + 1; j < appointments.length; j++) {
        const apt1 = appointments[i];
        const apt2 = appointments[j];
        
        // Only check appointments for same doctor that are pending or confirmed
        if (apt1.doctorId === apt2.doctorId && 
            (apt1.status === 'PENDING' || apt1.status === 'CONFIRMED') &&
            (apt2.status === 'PENDING' || apt2.status === 'CONFIRMED')) {
          
          const start1 = new Date(apt1.appointmentDate);
          const end1 = new Date(apt1.endTime);
          const start2 = new Date(apt2.appointmentDate);
          const end2 = new Date(apt2.endTime);
          
          // Check for overlap
          if (start1 < end2 && end1 > start2) {
            conflictCount++;
            console.log(`⚠️  CONFLICT DETECTED:`);
            console.log(`   Appointment ${i + 1}: ${start1.toLocaleString()} - ${end1.toLocaleString()}`);
            console.log(`   Appointment ${j + 1}: ${start2.toLocaleString()} - ${end2.toLocaleString()}`);
            console.log(`   Doctor: ${apt1.doctor.firstName} ${apt1.doctor.lastName}`);
            console.log('');
          }
        }
      }
    }
    
    if (conflictCount === 0) {
      console.log('✅ No time conflicts found!\n');
    } else {
      console.log(`⚠️  Found ${conflictCount} conflict(s)!\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

async function clearPendingAppointments() {
  try {
    console.log('🗑️  Clearing all PENDING appointments...\n');
    
    const result = await prisma.appointment.deleteMany({
      where: {
        status: 'PENDING',
      },
    });

    console.log(`✅ Deleted ${result.count} pending appointment(s).\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function clearAllAppointments() {
  try {
    console.log('⚠️  WARNING: This will delete ALL appointments!\n');
    
    const result = await prisma.appointment.deleteMany({});

    console.log(`✅ Deleted ${result.count} appointment(s).\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'clear-pending') {
  clearPendingAppointments();
} else if (command === 'clear-all') {
  console.log('⚠️  You are about to delete ALL appointments!');
  console.log('⏳ Starting in 3 seconds... Press Ctrl+C to cancel.\n');
  
  setTimeout(() => {
    clearAllAppointments();
  }, 3000);
} else {
  debugAppointments();
}
