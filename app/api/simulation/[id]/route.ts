import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  // Perbaikan: Definisikan params sebagai Promise
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // Perbaikan: Await params sebelum mengakses propertinya
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const body = await request.json();
    const { status } = body;

    // Validasi ID
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    // Update Database
    const updatedSimulation = await prisma.simulation.update({
      where: { id: id },
      data: { status: status },
    });

    return NextResponse.json(updatedSimulation);

  } catch (error) {
    console.error("Gagal update status:", error);
    return NextResponse.json({ error: 'Gagal update status' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}