/**
 * Script to update gender values for specific users in the database
 * 
 * Females: Nadia, Salma, Leila, uranya, rdwf
 * Males: Omar, Ahmed, Karim, mohamed, Ahmed
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FEMALE_USERS = ['Nadia', 'Salma', 'Leila', 'uranya', 'rdwf'];
const MALE_USERS = ['Omar', 'Ahmed', 'Karim', 'mohamed'];

async function updateUserGenders() {
  console.log('🔄 Starting gender update for users...\n');

  try {
    // Get all users who are doctors (have doctorProfile)
    const allUsers = await prisma.user.findMany({
      include: {
        doctorProfile: true
      }
    });

    console.log(`📊 Found ${allUsers.length} total users in database\n`);

    let femaleUpdates = 0;
    let maleUpdates = 0;
    let skipped = 0;

    for (const user of allUsers) {
      const firstName = user.firstName;
      let newGender = null;

      // Check if first name matches female list
      if (FEMALE_USERS.some(name => name.toLowerCase() === firstName.toLowerCase())) {
        newGender = 'FEMALE';
      }
      // Check if first name matches male list
      else if (MALE_USERS.some(name => name.toLowerCase() === firstName.toLowerCase())) {
        newGender = 'MALE';
      }

      if (newGender) {
        // Update the user's gender
        await prisma.user.update({
          where: { id: user.id },
          data: { gender: newGender }
        });

        const roleInfo = user.doctorProfile ? ' (Doctor)' : '';
        console.log(`✅ Updated ${firstName} ${user.lastName}${roleInfo}: gender set to ${newGender}`);
        
        if (newGender === 'FEMALE') femaleUpdates++;
        else maleUpdates++;
      } else {
        console.log(`⏭️  Skipped ${firstName} ${user.lastName}: Not in predefined list`);
        skipped++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Female updates: ${femaleUpdates}`);
    console.log(`   ✅ Male updates: ${maleUpdates}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📊 Total processed: ${allUsers.length}\n`);

    // Verify the updates
    console.log('🔍 Verifying updates...\n');
    const doctorsWithGender = await prisma.user.findMany({
      where: {
        doctorProfile: {
          isNot: null
        }
      },
      select: {
        firstName: true,
        lastName: true,
        gender: true,
        doctorProfile: {
          select: {
            specialization: true
          }
        }
      }
    });

    console.log('👨‍⚕️👩‍⚕️ Doctors with gender information:');
    doctorsWithGender.forEach(doctor => {
      const genderIcon = doctor.gender === 'FEMALE' ? '👩‍⚕️' : doctor.gender === 'MALE' ? '👨‍⚕️' : '🧑‍⚕️';
      console.log(`   ${genderIcon} ${doctor.firstName} ${doctor.lastName} - ${doctor.gender || 'NOT SET'} (${doctor.doctorProfile?.specialization || 'N/A'})`);
    });

    console.log('\n✅ Gender update completed successfully!\n');

  } catch (error) {
    console.error('❌ Error updating genders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateUserGenders()
  .then(() => {
    console.log('🎉 Script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
