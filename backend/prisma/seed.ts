import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@nexagear.com',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });

  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: customerPassword,
      role: 'customer',
    },
  });

  // ── Products ───────────────────────────────────────────────────────────
  // Using placehold.co for reliable local-dev images (no cert/CDN issues)
  const p1 = await prisma.product.create({
    data: {
      name: 'Wireless Noise-Cancelling Headphones',
      description:
        'Premium over-ear headphones with 30hr battery life and active noise cancellation.',
      price: 299.99,
      stock: 50,
      imageUrl: 'https://placehold.co/400x400/1e293b/f8fafc?text=Headphones',
    },
  });

  const p2 = await prisma.product.create({
    data: {
      name: 'Mechanical Gaming Keyboard',
      description:
        'RGB backlit mechanical keyboard with tactile switches and N-key rollover.',
      price: 149.99,
      stock: 30,
      imageUrl: 'https://placehold.co/400x400/312e81/e0e7ff?text=Keyboard',
    },
  });

  await prisma.product.create({
    data: {
      name: 'Ultra-wide Monitor 34"',
      description:
        '34-inch curved ultra-wide display with 144Hz refresh rate and HDR support.',
      price: 799.99,
      stock: 15,
      imageUrl: 'https://placehold.co/400x400/0f172a/94a3b8?text=Monitor',
    },
  });

  await prisma.product.create({
    data: {
      name: 'Ergonomic Office Chair',
      description:
        'Fully adjustable ergonomic chair with lumbar support and breathable mesh back.',
      price: 499.99,
      stock: 20,
      imageUrl: 'https://placehold.co/400x400/064e3b/6ee7b7?text=Chair',
    },
  });

  const p5 = await prisma.product.create({
    data: {
      name: 'Smart Watch Series X',
      description:
        'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.',
      price: 399.99,
      stock: 45,
      imageUrl: 'https://placehold.co/400x400/7c2d12/fed7aa?text=SmartWatch',
    },
  });

  await prisma.product.create({
    data: {
      name: 'Portable Bluetooth Speaker',
      description:
        'Waterproof 360° speaker with 24hr playtime and deep bass performance.',
      price: 89.99,
      stock: 60,
      imageUrl: 'https://placehold.co/400x400/1e3a5f/bfdbfe?text=Speaker',
    },
  });

  const p7 = await prisma.product.create({
    data: {
      name: 'Laptop Stand Pro',
      description:
        'Aluminium adjustable laptop stand with cable management and heat dissipation.',
      price: 59.99,
      stock: 80,
      imageUrl: 'https://placehold.co/400x400/374151/d1d5db?text=LaptopStand',
    },
  });

  await prisma.product.create({
    data: {
      name: '4K Webcam',
      description:
        'Ultra HD webcam with autofocus, noise-cancelling mic, and privacy shutter.',
      price: 129.99,
      stock: 35,
      imageUrl: 'https://placehold.co/400x400/4c0519/fecdd3?text=Webcam',
    },
  });

  // ── Offers (item-wise discounts) ──────────────────────────────────────
  const now = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.offer.create({
    data: {
      title: '20% Off Headphones',
      description: 'Limited time 20% discount on Wireless Noise-Cancelling Headphones.',
      discountType: 'percentage',
      discountValue: 20,
      startDate: now,
      endDate: future,
      isActive: true,
      productId: p1.id,
    },
  });

  await prisma.offer.create({
    data: {
      title: '$30 Off Gaming Keyboard',
      description: 'Save $30 on the Mechanical Gaming Keyboard this week only.',
      discountType: 'fixed_amount',
      discountValue: 30,
      startDate: now,
      endDate: future,
      isActive: true,
      productId: p2.id,
    },
  });

  await prisma.offer.create({
    data: {
      title: '15% Off Smart Watch',
      description: 'Get 15% off the Smart Watch Series X for a limited time.',
      discountType: 'percentage',
      discountValue: 15,
      startDate: now,
      endDate: future,
      isActive: true,
      productId: p5.id,
    },
  });

  await prisma.offer.create({
    data: {
      title: '$10 Off Laptop Stand',
      description: 'Save $10 on the Laptop Stand Pro.',
      discountType: 'fixed_amount',
      discountValue: 10,
      startDate: now,
      endDate: future,
      isActive: true,
      productId: p7.id,
    },
  });

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  👤 Admin    → admin@nexagear.com  / admin123');
  console.log('  👤 Customer → john@example.com    / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
