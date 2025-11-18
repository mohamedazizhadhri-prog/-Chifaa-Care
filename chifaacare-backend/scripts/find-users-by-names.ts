import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const NAMES = [
  'Michael Brown',
  'Jessica Davis',
  'Sarah Johnson',
  'Emily Chen',
];

async function main() {
  const results: any[] = [];

  for (const full of NAMES) {
    const parts = full.trim().split(/\s+/);
    if (parts.length < 2) continue;
    const first = parts[0];
    const last = parts.slice(1).join(' ');

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { firstName: { equals: first, mode: 'insensitive' } },
          { lastName: { equals: last, mode: 'insensitive' } },
        ],
      },
      include: { doctorProfile: true },
    });

    for (const u of users) {
      results.push({
        query: full,
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        doctorProfileId: u.doctorProfile?.id || null,
      });
    }
  }

  const outDir = path.resolve(__dirname, '../tmp');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `found-users-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');

  console.log(`Found ${results.length} matching user(s). Results written to ${outFile}`);
  for (const r of results) {
    console.log(`- ${r.id} | ${r.email} | ${r.firstName} ${r.lastName} | role=${r.role} | doctorProfile=${r.doctorProfileId}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Find script failed:', err);
  process.exit(1);
});
