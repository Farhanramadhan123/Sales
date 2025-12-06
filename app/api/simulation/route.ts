import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simpan ke database
    const savedSimulation = await prisma.simulation.create({
      data: {
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

        // Hasil Hitungan
        dpAmount: body.dpAmount,
        monthlyPayment: body.monthlyInstallment,
        totalFirstPay: body.totalDownPayment,
        interestRate: body.interestRatePct,
        insuranceRate: body.insuranceRatePct
      }
    });

    return NextResponse.json(savedSimulation, { status: 201 });

  } catch (error) {
    console.error("Gagal menyimpan simulasi:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menyimpan data.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}