import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const savedSimulation = await prisma.simulation.create({
      data: {
        // Data Input Dasar
        borrowerName: body.borrowerName,
        coBorrowerName: body.coBorrowerName,
        salesName: body.salesName,
        status: body.status,
        unitName: body.unitName,
        nopol: body.nopol,
        category: body.category,
        subCategory: body.subCategory,
        isLoadingUnit: body.isLoadingUnit,
        vehiclePrice: parseFloat(body.price),
        dpPercent: parseFloat(body.dpPercent),
        tenor: parseInt(body.tenor),
        paymentType: body.paymentType,
        adminFee: parseFloat(body.adminFee),
        insuranceLabel: body.selectedInsuranceLabel,

        // Hasil Hitungan Utama
        dpAmount: body.dpAmount,
        monthlyPayment: body.monthlyInstallment,
        totalFirstPay: body.totalDownPayment,
        interestRate: body.interestRatePct,
        insuranceRate: body.insuranceRatePct,
        insuranceAmount: body.insuranceAmount,

        // TAMBAHAN DATA LENGKAP
        principalPure: body.principalPure,
        policyFee: body.policyFee,
        totalAR: body.totalAR,
        totalInterest: body.totalInterest,
        totalLoan: body.totalLoan,
        policyFeeTDP: body.policyFeeTDP,
        firstInstallment: body.firstInstallment,
        nilaiAP: body.nilaiAP
      }
    });

    return NextResponse.json(savedSimulation, { status: 201 });

  } catch (_error) {
    console.error("Gagal menyimpan simulasi:", _error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menyimpan data.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const simulations = await prisma.simulation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(simulations);
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}