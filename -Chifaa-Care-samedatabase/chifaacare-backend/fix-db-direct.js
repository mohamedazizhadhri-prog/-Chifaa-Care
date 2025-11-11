const { Client } = require('pg');
require('dotenv').config();

async function fixDatabase() {
  console.log('🔧 Starting direct database fix...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Add the missing columns
    console.log('\n📝 Adding missing columns...');
    
    await client.query(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "googleCalendarToken" TEXT,
      ADD COLUMN IF NOT EXISTS "googleCalendarRefresh" TEXT,
      ADD COLUMN IF NOT EXISTS "googleCalendarExpiry" TIMESTAMP(3);
    `);
    
    console.log('✓ Columns added successfully');

    // Add unique index
    console.log('\n📝 Adding unique index...');
    
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'User' 
          AND indexname = 'User_googleCalendarToken_key'
        ) THEN
          CREATE UNIQUE INDEX "User_googleCalendarToken_key" ON "User"("googleCalendarToken");
        END IF;
      END $$;
    `);
    
    console.log('✓ Index added successfully');

    // Verify columns exist
    console.log('\n🔍 Verifying columns...');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'User'
      AND column_name IN ('googleCalendarToken', 'googleCalendarRefresh', 'googleCalendarExpiry')
      ORDER BY column_name;
    `);

    console.log('\n✅ Columns verified:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    console.log('\n✅ Database fixed successfully!');
    console.log('\n🔄 Now regenerating Prisma Client...');
    
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('\n✅ ALL DONE! You can now restart your server.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixDatabase();
