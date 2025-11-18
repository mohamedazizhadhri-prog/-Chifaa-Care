require('dotenv').config();
const { Client } = require('pg');

async function diagnoseConnection() {
  console.log('🔍 Database Connection Diagnostic Tool\n');
  console.log('=' .repeat(50));
  
  // Check if DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file!');
    process.exit(1);
  }
  
  console.log('✓ DATABASE_URL found in environment');
  
  // Parse the connection string (hide password)
  const url = process.env.DATABASE_URL;
  const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
  console.log('Database URL (masked):', maskedUrl);
  console.log('\n' + '=' .repeat(50));
  
  // Test 1: Basic Connection
  console.log('\n📡 Test 1: Basic Connection');
  console.log('-'.repeat(50));
  
  const client = new Client({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000 // 10 seconds timeout
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test 2: Simple Query
    console.log('\n📊 Test 2: Database Query');
    console.log('-'.repeat(50));
    const result = await client.query('SELECT NOW() as time, current_database() as db');
    console.log('✅ Query successful!');
    console.log('Current Time:', result.rows[0].time);
    console.log('Database Name:', result.rows[0].db);
    
    // Test 3: Check Tables
    console.log('\n📋 Test 3: Checking Tables');
    console.log('-'.repeat(50));
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('✅ Found', tables.rows.length, 'tables:');
      tables.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found. Database may need migration.');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 All tests passed! Database is ready to use.');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.error('❌ Connection/Query failed!');
    console.log('='.repeat(50));
    console.error('\nError Details:');
    console.error('Type:', error.code || 'Unknown');
    console.error('Message:', error.message);
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('-'.repeat(50));
    
    if (error.code === 'ENOTFOUND') {
      console.log('• DNS resolution failed. Check:');
      console.log('  - Your internet connection');
      console.log('  - The database hostname is correct');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('• Connection refused. Check:');
      console.log('  - Database is running');
      console.log('  - Port number is correct');
      console.log('  - Firewall settings');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('• Connection timed out. Check:');
      console.log('  - Your internet connection');
      console.log('  - Database is accessible from your location');
    } else if (error.message.includes('password')) {
      console.log('• Authentication failed. Check:');
      console.log('  - Database password is correct');
      console.log('  - Username is correct');
    } else {
      console.log('• General connection error');
      console.log('  - Verify DATABASE_URL format');
      console.log('  - Check Neon dashboard for database status');
      console.log('  - Ensure SSL is enabled on the database');
    }
    
    console.log('\n📝 Connection String Format:');
    console.log('postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require');
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

diagnoseConnection();
