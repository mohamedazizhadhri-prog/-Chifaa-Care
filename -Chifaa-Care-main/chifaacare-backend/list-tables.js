const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:uranya@localhost:5432/mydb?schema=public'
    }
  }
});

async function listTables() {
  try {
    console.log('📋 Listing all tables in the database...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    
    console.log('\n✅ Database tables:');
    console.table(tables);
    
    console.log('\n🔍 Checking _prisma_migrations table...');
    const migrations = await prisma.$queryRaw`
      SELECT * FROM _prisma_migrations;
    `;
    console.table(migrations);
    
  } catch (error) {
    console.error('❌ Error listing tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listTables();
