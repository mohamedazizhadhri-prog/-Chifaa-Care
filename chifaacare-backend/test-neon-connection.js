require('dotenv').config();
const { Client } = require('pg');

async function testNeonConnection() {
  console.log('Testing Neon Database Connection...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Neon...');
    await client.connect();
    console.log('✓ Connected successfully!\n');

    console.log('Testing query...');
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✓ Query successful!\n');
    console.log('Current Time:', result.rows[0].current_time);
    console.log('PostgreSQL Version:', result.rows[0].postgres_version);
    
    console.log('\n✅ Neon database is working perfectly!');
    return true;
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

testNeonConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
