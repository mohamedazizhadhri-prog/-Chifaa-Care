import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const doctors = await prisma.user.findMany({
    where: {
      role: 'DOCTOR',
      doctorProfile: {
        is: {
          OR: [
            { languages: { contains: 'Anglais' } },
            { languages: { contains: 'anglais' } },
            { languages: { contains: 'English' } },
            { languages: { contains: 'english' } },
          ],
        },
      },
    },
    include: { doctorProfile: true },
  });

  if (!doctors || doctors.length === 0) {
    console.log('No English doctors found.');
    await prisma.$disconnect();
    return;
  }

  const outDir = path.resolve(__dirname, '../tmp');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `english-doctors-backup-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(doctors, null, 2), 'utf8');

  console.log(`Exported ${doctors.length} doctor(s) to ${outFile}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
