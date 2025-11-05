// Usage: node scripts/seed-roles-permissions.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const roles = [
  { name: 'ADMIN', description: 'System administrator' },
  { name: 'DOCTOR', description: 'Doctor user' },
  { name: 'PATIENT', description: 'Patient user' },
  { name: 'CLINIC_ADMIN', description: 'Clinic administrator' },
  { name: 'CLINIC_STAFF', description: 'Clinic staff' },
  { name: 'NURSE', description: 'Nurse' },
  { name: 'STAFF', description: 'General staff' },
  { name: 'SUPER_ADMIN', description: 'Super admin' },
];

const permissions = [
  { name: 'appointments:read', resource: 'Appointment', action: 'read', description: 'Read appointments' },
  { name: 'appointments:write', resource: 'Appointment', action: 'write', description: 'Create/update appointments' },
  { name: 'users:read', resource: 'User', action: 'read', description: 'Read users' },
  { name: 'users:write', resource: 'User', action: 'write', description: 'Create/update users' },
  { name: 'clinics:manage', resource: 'Clinic', action: 'manage', description: 'Manage clinics' },
];

async function main() {
  // Seed roles
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`Upserted role: ${role.name}`);
  }
  // Seed permissions
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    console.log(`Upserted permission: ${perm.name}`);
  }
  // Link users to roles
  const users = await prisma.user.findMany();
  for (const user of users) {
    // Use user.role string to link to Role
    const role = await prisma.role.findUnique({ where: { name: user.role } });
    if (role) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      });
      console.log(`Linked user ${user.email} to role ${role.name}`);
    }
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
