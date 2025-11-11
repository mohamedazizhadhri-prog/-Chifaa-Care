const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Create a new Prisma client
const prisma = new PrismaClient();

async function testSQLiteConnection() {
  try {
    console.log('🔄 Testing SQLite database connection...');
    console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    console.log('Test query result:', result);
    
    // Test SQLite version
    console.log('\n📋 Checking SQLite version...');
    const version = await prisma.$queryRaw`SELECT sqlite_version() as version`;
    console.log('SQLite version:', version[0].version);
    
    // Try to list all tables to verify schema access
    console.log('\n📋 Checking database tables...');
    const tables = await prisma.$queryRaw`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name;
    `;
    console.log('Available tables:', tables.map(t => t.name));
    
    console.log('\n🎉 SQLite database setup complete!');
    console.log('✅ ChifaaCare backend is ready to run!');
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run the test
testSQLiteConnection();
