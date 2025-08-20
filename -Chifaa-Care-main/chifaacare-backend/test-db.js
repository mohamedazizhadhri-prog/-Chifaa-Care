const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test the connection by querying the database
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    console.log('Test query result:', result);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
