import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // 1. Ambil Data Bunga
    const interestRates = await prisma.interestRate.findMany({
      orderBy: [
        { category: 'asc' },
        { paymentType: 'asc' },
        { star: 'asc' },
        { tenor: 'asc' },
      ],
    });

    // 2. Ambil Data Asuransi (Sesuai Model Prisma Anda)
    // Kita ambil semua agar frontend bisa memfilter berdasarkan Range Harga & Label
    const insuranceRates = await prisma.insuranceRate.findMany({
      orderBy: [
        { category: 'asc' },
        { tenor: 'asc' },
        { minPrice: 'asc' },
      ],
    });

    return NextResponse.json(
      { interestRates, insuranceRates },
      { status: 200 }
    );

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}