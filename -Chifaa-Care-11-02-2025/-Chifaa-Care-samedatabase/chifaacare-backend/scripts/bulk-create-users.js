// Usage: node scripts/bulk-create-users.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  { name: 'Ameni Jlassi', email: 'sarah.jlassi@example.com', password: 'Sarah@123' },
  { name: 'Dr. Ahmed Ben Ali', email: 'doctor@chifaacare.com', password: 'Doctor@123' },
  { name: 'Fatima Al-Zahra', email: 'patient@chifaacare.com', password: 'Patient@123' },
  { name: 'Maria Garcia', email: 'dr.garcia@chifaacare.com', password: 'Garcia@123' },
  { name: 'Zakrya Ouchani', email: 'zakryaouchani@example.com', password: 'Zakrya@123' },
  { name: 'ChifaaCare Clinic', email: 'clinic@chifaacare.com', password: 'Clinic@123' },
  { name: 'Admin User', email: 'admin@chifaacare.com', password: 'Admin@123' },
  { name: 'Mouna Nourdin', email: 'mouna1967@gmail.com', password: 'Mouna@123' },
  { name: 'Amine Ben Chalfouh', email: 'amine.chalfouh@example.com', password: 'Amine@123' },
  { name: 'Test Clinic', email: 'testclinic@chifaacare.com', password: 'TestClinic@123' },
  { name: 'Tassnim Ben Chaben', email: 'tassnim.chaben@example.com', password: 'Tassnim@123' },
  { name: 'Jassmine2 Admin', email: 'admin222@chifaacare.com', password: 'Admin222@123' },
  { name: 'Yassin Ferchichi', email: 'yassinroyal@gmail.com', password: 'Yassin@123' },
  { name: 'Samira Lkhla', email: 'samira.khla@example.com', password: 'Samira@123' },
  { name: 'Louay Chokri', email: 'louaychokri124@gmail.com', password: 'Louay@123' },
  { name: 'Kamel Farzit', email: 'kamel.farzit@example.com', password: 'Kamel@123' },
  { name: 'Ranya Yakhlef', email: 'ranya@yakhlef.com', password: 'Ranya@123' },
  { name: 'Admin User (Main)', email: 'admin.chifaacare@gmail.com', password: 'AdminMain@123' },
];

function getRole(user) {
  if (/admin/i.test(user.name) || /admin/i.test(user.email)) return 'ADMIN';
  if (/clinic/i.test(user.name) || /clinic/i.test(user.email)) return 'CLINIC_ADMIN';
  if (/dr\.|doctor/i.test(user.name) || /dr\./i.test(user.email)) return 'DOCTOR';
  return 'PATIENT';
}

async function main() {
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    const role = getRole(user);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: hashed,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        role,
        isActive: true,
      },
    });
    console.log(`Upserted: ${user.email} as ${role}`);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
