// Ensure SystemSetting table exists without needing Prisma generate
// Uses pg (already installed) and DATABASE_URL
const { Client } = require('pg');

(async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('[db-ensure-system-setting] Missing DATABASE_URL in environment');
    process.exit(1);
  }
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    // Enable required extension for gen_random_uuid()
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    await client.query(`
      CREATE TABLE IF NOT EXISTS "SystemSetting" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        key text UNIQUE NOT NULL,
        value jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS systemsetting_key_idx ON "SystemSetting"(key);
    `);

    console.log('[db-ensure-system-setting] SystemSetting table ensured');
    process.exit(0);
  } catch (err) {
    console.error('[db-ensure-system-setting] Error:', err.message);
    process.exit(1);
  } finally {
    try { await client.end(); } catch {}
  }
})();
