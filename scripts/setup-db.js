const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Dropping existing tables...');
  
  // Drop tables in correct order (respecting foreign keys)
  await prisma.$executeRaw`DROP TABLE IF EXISTS "OrderItem" CASCADE;`;
  await prisma.$executeRaw`DROP TABLE IF EXISTS "Order" CASCADE;`;
  await prisma.$executeRaw`DROP TABLE IF EXISTS "Product" CASCADE;`;
  await prisma.$executeRaw`DROP TABLE IF EXISTS "User" CASCADE;`;
  
  console.log('✅ Tables dropped successfully!');
  console.log('📦 Creating new tables...');
  
  // Create tables using Prisma migrations
  const { execSync } = require('child_process');
  try {
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    console.log('✅ Tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
