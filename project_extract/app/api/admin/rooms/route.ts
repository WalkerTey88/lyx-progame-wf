// app/api/admin/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: {
        roomNumber: 'asc',
      },
      include: {
        roomType: true,
      },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('GET /api/admin/rooms error', error);
    return NextResponse.json(
      { error: 'Failed to load rooms.' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 },
      );
    }

    const { roomTypeId, roomNumber, isActive } = body as {
      roomTypeId?: string;
      roomNumber?: string;
      isActive?: boolean;
    };

    if (!roomTypeId || !roomNumber) {
      return NextResponse.json(
        { error: 'roomTypeId and roomNumber are required.' },
        { status: 400 },
      );
    }

    const room = await prisma.room.create({
      data: {
        roomTypeId,
        roomNumber,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/rooms error', error);
    return NextResponse.json(
      { error: 'Failed to create room.' },
      { status: 500 },
    );
  }
}
