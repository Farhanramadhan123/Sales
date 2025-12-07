// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Buat Akun PROSESOR (Admin)
  const passwordProsesor = await hash('admin123', 12);
  const prosesor = await prisma.user.upsert({
    where: { email: 'admin@setirkanan.co.id' },
    update: {},
    create: {
      email: 'admin@setirkanan.co.id',
      name: 'Super Prosesor',
      password: passwordProsesor,
      role: 'PROSESOR',
    },
  });

  // 2. Buat Akun SALES
  const passwordSales = await hash('sales123', 12);
  const sales = await prisma.user.upsert({
    where: { email: 'sales@setirkanan.co.id' },
    update: {},
    create: {
      email: 'sales@setirkanan.co.id',
      name: 'Sales Juara',
      password: passwordSales,
      role: 'SALES',
    },
  });

  console.log({ prosesor, sales });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });