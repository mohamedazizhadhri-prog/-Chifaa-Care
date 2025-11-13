// Usage: node scripts/seed-more-demo-data.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Link roles to permissions (RolePermission)
  const roles = await prisma.role.findMany();
  const perms = await prisma.permission.findMany();
  for (const role of roles) {
    for (const perm of perms) {
      // Give all permissions to ADMIN, some to others
      if (role.name === 'ADMIN' || (role.name === 'CLINIC_ADMIN' && perm.resource !== 'User')) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  }
  // 2. EmergencyContact, InsuranceInfo, MedicalHistory for each patient
  const patients = await prisma.user.findMany({ where: { role: 'PATIENT' } });
  for (const user of patients) {
    const profile = await prisma.patientProfile.findUnique({ where: { userId: user.id } });
    if (profile) {
      await prisma.emergencyContact.create({
        data: {
          patientProfileId: profile.id,
          name: 'Jane Doe',
          relationship: 'Mother',
          phone: '+1234567891',
          email: 'jane.doe@example.com',
          address: '456 Main St',
          isPrimary: true,
        },
      });
      await prisma.insuranceInfo.create({
        data: {
          patientProfileId: profile.id,
          provider: 'HealthInsure',
          policyNumber: 'POL123456',
          validUntil: new Date(Date.now() + 31536000000),
        },
      });
      await prisma.medicalHistory.create({
        data: {
          patientProfileId: profile.id,
          condition: 'Hypertension',
          diagnosisDate: new Date(Date.now() - 31536000000),
          status: 'Managed',
        },
      });
    }
  }
  // 3. Document for each clinic
  const clinics = await prisma.clinic.findMany();
  for (const clinic of clinics) {
    await prisma.document.create({
      data: {
        clinicId: clinic.id,
        name: 'License.pdf',
        type: 'LICENSE',
        s3Key: 'license.pdf',
        mimeType: 'application/pdf',
        size: 123456,
      },
    });
  }
  // 4. PushSubscription and Notification for each user
  const users = await prisma.user.findMany();
  for (const user of users) {
    await prisma.pushSubscription.create({
      data: {
        userId: user.id,
        endpoint: 'https://push.example.com/' + user.id,
        p256dh: 'p256dh-key',
        auth: 'auth-key',
      },
    });
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome!',
        body: 'Your account is ready.',
      },
    });
  }
  // 5. AuditLog for each clinic
  for (const clinic of clinics) {
    await prisma.auditLog.create({
      data: {
        userId: users[0].id,
        clinicId: clinic.id,
        action: 'CREATE',
        resource: 'Clinic',
        success: true,
      },
    });
  }
  // 6. Payout for each doctor/clinic
  const doctors = await prisma.user.findMany({ where: { role: 'DOCTOR' } });
  for (let i = 0; i < Math.min(doctors.length, clinics.length); i++) {
    await prisma.payout.create({
      data: {
        clinicId: clinics[i].id,
        doctorId: doctors[i].id,
        amount: 100,
        currency: 'USD',
        status: 'PENDING',
      },
    });
  }
  // 7. TreatmentNote and Medication for each TreatmentPlan
  const plans = await prisma.treatmentPlan.findMany();
  for (const plan of plans) {
    await prisma.treatmentNote.create({
      data: {
        planId: plan.id,
        doctorId: plan.doctorId,
        content: 'Initial assessment: all good.',
      },
    });
    await prisma.medication.create({
      data: {
        planId: plan.id,
        name: 'Aspirin',
        dose: '100mg',
        frequency: 'Once daily',
      },
    });
  }
  console.log('Seeded all remaining demo tables!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
