const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function fixDatabase() {
  console.log('🔧 Fixing database schema...\n');

  try {
    // Step 1: Create a migration
    console.log('Step 1: Creating migration...');
    const { stdout: migrateStdout, stderr: migrateStderr } = await execAsync(
      'npx prisma migrate dev --name add_google_calendar_fields --create-only',
      { cwd: __dirname }
    );
    console.log(migrateStdout);
    if (migrateStderr) console.error(migrateStderr);

    // Step 2: Apply the migration
    console.log('\nStep 2: Applying migration...');
    const { stdout: deployStdout, stderr: deployStderr } = await execAsync(
      'npx prisma migrate deploy',
      { cwd: __dirname }
    );
    console.log(deployStdout);
    if (deployStderr) console.error(deployStderr);

    // Step 3: Regenerate Prisma Client
    console.log('\nStep 3: Regenerating Prisma Client...');
    const { stdout: generateStdout, stderr: generateStderr } = await execAsync(
      'npx prisma generate',
      { cwd: __dirname }
    );
    console.log(generateStdout);
    if (generateStderr) console.error(generateStderr);

    console.log('\n✅ Database fixed successfully!');
    console.log('You can now restart your server.');
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
}

fixDatabase();
