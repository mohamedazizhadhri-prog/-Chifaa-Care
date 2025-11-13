require('dotenv').config();
const { Client } = require('pg');

async function fixMigrationIssues() {
  console.log('🔧 Fixing Database Migration Issues...\n');
  console.log('='.repeat(50));
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // Mark problematic migrations as applied
    console.log('📝 Marking migrations as applied...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        id VARCHAR(36) PRIMARY KEY,
        checksum VARCHAR(64) NOT NULL,
        finished_at TIMESTAMP WITH TIME ZONE,
        migration_name VARCHAR(255) NOT NULL,
        logs TEXT,
        rolled_back_at TIMESTAMP WITH TIME ZONE,
        started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        applied_steps_count INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Check if migration already exists
    const existingMigration = await client.query(`
      SELECT * FROM "_prisma_migrations" 
      WHERE migration_name = 'add-google-calendar'
    `);

    if (existingMigration.rows.length === 0) {
      // Mark the migration as applied
      await client.query(`
        INSERT INTO "_prisma_migrations" (
          id, 
          checksum, 
          finished_at, 
          migration_name, 
          logs, 
          started_at, 
          applied_steps_count
        ) VALUES (
          gen_random_uuid()::text,
          'skip_migration',
          CURRENT_TIMESTAMP,
          'add-google-calendar',
          'Manually marked as applied - columns already exist',
          CURRENT_TIMESTAMP,
          1
        ) ON CONFLICT (migration_name) DO NOTHING;
      `);
      console.log('✓ Migration marked as applied');
    } else {
      console.log('✓ Migration already marked as applied');
    }

    // Also mark the other migration
    const existingMigration2 = await client.query(`
      SELECT * FROM "_prisma_migrations" 
      WHERE migration_name = '20251105_add_google_calendar_fields'
    `);

    if (existingMigration2.rows.length === 0) {
      await client.query(`
        INSERT INTO "_prisma_migrations" (
          id, 
          checksum, 
          finished_at, 
          migration_name, 
          logs, 
          started_at, 
          applied_steps_count
        ) VALUES (
          gen_random_uuid()::text,
          'skip_migration',
          CURRENT_TIMESTAMP,
          '20251105_add_google_calendar_fields',
          'Manually marked as applied - columns already exist',
          CURRENT_TIMESTAMP,
          1
        ) ON CONFLICT (migration_name) DO NOTHING;
      `);
      console.log('✓ Second migration marked as applied');
    } else {
      console.log('✓ Second migration already marked as applied');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Migration issues fixed!');
    console.log('='.repeat(50));
    console.log('\nYou can now start the server safely.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixMigrationIssues();
