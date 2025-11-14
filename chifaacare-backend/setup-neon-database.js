const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function setupNeonDatabase() {
  try {
    console.log('🚀 Setting up Neon database for ChifaaCare...');
    
    // Test connection first
    console.log('🔄 Testing connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connection successful!');
    
    // Enable pgcrypto extension if not already enabled
    console.log('🔐 Enabling pgcrypto extension...');
    try {
      await prisma.$queryRaw`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      console.log('✅ pgcrypto extension enabled');
    } catch (error) {
      console.log('⚠️  pgcrypto extension may already be enabled:', error.message);
    }
    
    // Check current migration status
    console.log('📋 Checking migration status...');
    try {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at 
        FROM "_prisma_migrations" 
        ORDER BY finished_at DESC;
      `;
      
      if (migrations.length > 0) {
        console.log('✅ Migrations found:', migrations.length);
        console.log('Latest migration:', migrations[0].migration_name);
      } else {
        console.log('⚠️  No migrations found - you may need to run migrations');
        console.log('💡 Run: npm run migrate:deploy');
      }
    } catch (error) {
      console.log('⚠️  Migration table not found - run migrations first');
    }
    
    // Check if tables exist
    console.log('📋 Checking existing tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    if (tables.length > 0) {
      console.log('✅ Found tables:', tables.map(t => t.table_name).join(', '));
    } else {
      console.log('⚠️  No tables found - run migrations to create schema');
    }
    
    console.log('\n🎉 Neon database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run migrations: npm run migrate:deploy');
    console.log('   2. Generate Prisma client: npm run prisma:generate');
    console.log('   3. Seed database (optional): npm run seed:safe');
    console.log('   4. Start the server: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection troubleshooting:');
      console.log('   1. Check your DATABASE_URL in .env file');
      console.log('   2. Ensure your Neon project is active');
      console.log('   3. Verify the connection string format');
    }
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Authentication troubleshooting:');
      console.log('   1. Check username and password in DATABASE_URL');
      console.log('   2. Ensure credentials are correct in Neon console');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup
setupNeonDatabase();
