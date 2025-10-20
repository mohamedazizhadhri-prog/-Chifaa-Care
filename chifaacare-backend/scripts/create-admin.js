// Create an ADMIN user directly via SQL to allow testing admin endpoints
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('[create-admin] Missing DATABASE_URL');
      process.exit(1);
    }

    const email = process.env.ADMIN_EMAIL || 'admin@chifaacare.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin#12345';
    const firstName = 'Admin';
    const lastName = 'User';

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    const { rows: exist } = await client.query('SELECT id, email FROM "User" WHERE email = $1 LIMIT 1', [email]);
    if (exist.length > 0) {
      console.log(`[create-admin] Admin already exists: ${email}`);
      await client.end();
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);

    const insert = `
      INSERT INTO "User" (
        id, email, password, "firstName", "lastName", role, "isEmailVerified", "isActive", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, 'ADMIN', true, true, NOW(), NOW()
      ) RETURNING id, email, role
    `;

    const { rows } = await client.query(insert, [email, hash, firstName, lastName]);
    console.log('[create-admin] Created admin:', rows[0]);

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('[create-admin] Error:', err.message);
    process.exit(1);
  }
})();
