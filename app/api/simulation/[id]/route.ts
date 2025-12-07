// app/api/simulation/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth'; // Helper Auth

const prisma = new PrismaClient();

// UPDATE STATUS (PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // PROTEKSI: Cek apakah PROSESOR
    const session = await getSession();
    if (!session || (session as any).role !== 'PROSESOR') {
       return NextResponse.json({ error: 'Akses Ditolak: Hanya Prosesor yang boleh mengubah status' }, { status: 403 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    const { status } = body;

    if (!id || isNaN(id)) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    const updatedSimulation = await prisma.simulation.update({
      where: { id: id },
      data: { status: status },
    });

    return NextResponse.json(updatedSimulation);

  } catch (error) {
    return NextResponse.json({ error: 'Gagal update status' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE DATA (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // PROTEKSI: Cek apakah PROSESOR
    const session = await getSession();
    if (!session || (session as any).role !== 'PROSESOR') {
       return NextResponse.json({ error: 'Akses Ditolak: Hanya Prosesor yang boleh menghapus' }, { status: 403 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (!id || isNaN(id)) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    await prisma.simulation.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Gagal hapus data' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}