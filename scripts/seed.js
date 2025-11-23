const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with sample data...');

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@valentepro.com' },
    update: {},
    create: {
      email: 'admin@valentepro.com',
      name: 'Admin User',
      role: 'admin',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      role: 'user',
    },
  });

  console.log('✅ Users created');

  // Create products
  const products = [
    {
      name: 'Laptop Pro 15"',
      description: 'High-performance laptop with 16GB RAM and 512GB SSD',
      price: 1299.99,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      stock: 15,
      featured: true,
      userId: admin.id,
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      price: 29.99,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      stock: 50,
      featured: false,
      userId: admin.id,
    },
    {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with blue switches',
      price: 89.99,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
      stock: 30,
      featured: true,
      userId: admin.id,
    },
    {
      name: 'USB-C Hub',
      description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
      price: 49.99,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400',
      stock: 40,
      featured: false,
      userId: user1.id,
    },
    {
      name: 'Webcam HD',
      description: '1080p HD webcam with auto-focus and built-in microphone',
      price: 79.99,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400',
      stock: 25,
      featured: true,
      userId: user1.id,
    },
    {
      name: 'Desk Lamp LED',
      description: 'Adjustable LED desk lamp with USB charging port',
      price: 39.99,
      category: 'Office',
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
      stock: 35,
      featured: false,
      userId: user2.id,
    },
    {
      name: 'Ergonomic Chair',
      description: 'Comfortable office chair with lumbar support',
      price: 299.99,
      category: 'Furniture',
      imageUrl: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=400',
      stock: 10,
      featured: true,
      userId: user2.id,
    },
    {
      name: 'Standing Desk',
      description: 'Adjustable height standing desk with electric motor',
      price: 499.99,
      category: 'Furniture',
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400',
      stock: 8,
      featured: true,
      userId: admin.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('✅ Products created');

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      status: 'completed',
      total: 1389.98,
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { name: 'Laptop Pro 15"' } })).id,
            quantity: 1,
            price: 1299.99,
          },
          {
            productId: (await prisma.product.findFirst({ where: { name: 'Mechanical Keyboard' } })).id,
            quantity: 1,
            price: 89.99,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      status: 'processing',
      total: 109.98,
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { name: 'Wireless Mouse' } })).id,
            quantity: 2,
            price: 29.99,
          },
          {
            productId: (await prisma.product.findFirst({ where: { name: 'USB-C Hub' } })).id,
            quantity: 1,
            price: 49.99,
          },
        ],
      },
    },
  });

  console.log('✅ Orders created');
  console.log('🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Products: ${await prisma.product.count()}`);
  console.log(`   - Orders: ${await prisma.order.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
