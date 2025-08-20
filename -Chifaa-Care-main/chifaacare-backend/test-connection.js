const { PrismaClient } = require('@prisma/client');

// Create a new Prisma client with explicit connection URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:uranya@localhost:5432/mydb?schema=public'
    }
  }
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    console.log('Test query result:', result);
    
    // Try to list all tables to verify schema access
    console.log('\n📋 Checking database tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log('Available tables:', tables);
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testConnection();
