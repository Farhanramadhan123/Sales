// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Opsional: Hapus baris ini jika tidak ingin melihat log query di terminal
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;