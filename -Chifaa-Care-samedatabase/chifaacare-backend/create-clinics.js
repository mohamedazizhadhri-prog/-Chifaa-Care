const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createClinics() {
  console.log('🏥 Creating clinics in database...\n');

  const clinics = [
    {
      name: 'Tripoli Medical Center',
      description: 'Premier healthcare facility in Tripoli',
      email: 'contact@tripolimedical.ly',
      phone: '+218-21-444-5555',
      address: 'Gargaresh Road, Building 42',
      city: 'Tripoli',
      state: 'Tripoli District',
      country: 'Libya',
      postalCode: '00218',
      website: 'https://tripolimedical.ly',
      status: 'ACTIVE',
      onboardingStep: 'COMPLETED'
    },
    {
      name: 'Benghazi Health Clinic',
      description: 'Modern healthcare services in Benghazi',
      email: 'info@benghazihealth.ly',
      phone: '+218-61-222-3333',
      address: 'Al Keish Street, Suite 15',
      city: 'Benghazi',
      state: 'Benghazi District',
      country: 'Libya',
      postalCode: '00218',
      website: 'https://benghazihealth.ly',
      status: 'ACTIVE',
      onboardingStep: 'COMPLETED'
    },
    {
      name: 'Misrata Care Center',
      description: 'Comprehensive medical care in Misrata',
      email: 'admin@misratacare.ly',
      phone: '+218-51-666-7777',
      address: 'Mediterranean Avenue, Floor 3',
      city: 'Misrata',
      state: 'Misrata District',
      country: 'Libya',
      postalCode: '00218',
      website: 'https://misratacare.ly',
      status: 'ACTIVE',
      onboardingStep: 'COMPLETED'
    },
    {
      name: 'Tunis Central Hospital',
      description: 'Leading medical facility in Tunis',
      email: 'contact@tuniscentral.tn',
      phone: '+216-71-888-9999',
      address: 'Avenue Habib Bourguiba, Building 25',
      city: 'Tunis',
      state: 'Tunis Governorate',
      country: 'Tunisia',
      postalCode: '1000',
      website: 'https://tuniscentral.tn',
      status: 'ACTIVE',
      onboardingStep: 'COMPLETED'
    }
  ];

  let created = 0;
  let skipped = 0;

  for (const clinicData of clinics) {
    try {
      // Check if clinic already exists
      const existing = await prisma.clinic.findUnique({
        where: { email: clinicData.email }
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${clinicData.name} (already exists)`);
        skipped++;
      } else {
        const clinic = await prisma.clinic.create({
          data: clinicData
        });
        console.log(`✅ Created: ${clinicData.name}`);
        console.log(`   📧 Email: ${clinicData.email}`);
        console.log(`   📍 Location: ${clinicData.city}, ${clinicData.country}`);
        console.log(`   🏥 Status: ${clinicData.status}\n`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error creating ${clinicData.name}:`, error.message);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Created: ${created} clinic(s)`);
  console.log(`⏭️  Skipped: ${skipped} clinic(s) (already exist)`);
  console.log(`📍 Libya: 3 clinics (Tripoli, Benghazi, Misrata)`);
  console.log(`📍 Tunisia: 1 clinic (Tunis)`);
  
  await prisma.$disconnect();
  console.log('\n✅ Done! Database updated successfully.');
}

createClinics()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
