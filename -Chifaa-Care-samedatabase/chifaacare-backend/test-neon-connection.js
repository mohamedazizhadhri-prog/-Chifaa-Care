const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Create a new Prisma client
const prisma = new PrismaClient();

async function testNeonConnection() {
  try {
    console.log('🔄 Testing Neon database connection...');
    console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    console.log('Test query result:', result);
    
    // Test PostgreSQL version
    console.log('\n📋 Checking PostgreSQL version...');
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('PostgreSQL version:', version[0].version);
    
    // Check if pgcrypto extension is available
    console.log('\n🔐 Checking pgcrypto extension...');
    try {
      const pgcryptoCheck = await prisma.$queryRaw`SELECT gen_random_uuid() as test_uuid`;
      console.log('✅ pgcrypto extension is available');
      console.log('Test UUID:', pgcryptoCheck[0].test_uuid);
    } catch (error) {
      console.log('⚠️  pgcrypto extension not available:', error.message);
    }
    
    // Try to list all tables to verify schema access
    console.log('\n📋 Checking database tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('Available tables:', tables.map(t => t.table_name));
    
    // Check if migrations have been run
    console.log('\n🔄 Checking migration status...');
    try {
      const migrationCheck = await prisma.$queryRaw`
        SELECT * FROM "_prisma_migrations" 
        ORDER BY finished_at DESC 
        LIMIT 5;
      `;
      console.log('Recent migrations:', migrationCheck.length);
      if (migrationCheck.length > 0) {
        console.log('Latest migration:', migrationCheck[0].migration_name);
      }
    } catch (error) {
      console.log('⚠️  No migrations found - you may need to run migrations');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Check if your Neon database URL is correct');
      console.log('   2. Ensure your Neon project is active');
      console.log('   3. Verify network connectivity');
      console.log('   4. Check if your IP is whitelisted (if applicable)');
    }
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Authentication error:');
      console.log('   1. Check your database username and password');
      console.log('   2. Ensure credentials are correctly set in DATABASE_URL');
    }
    
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run the test
testNeonConnection();
