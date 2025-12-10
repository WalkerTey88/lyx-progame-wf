// app/api/admin/rooms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const id = context.params.id;

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 },
      );
    }

    const { roomNumber, isActive, roomTypeId } = body as {
      roomNumber?: string;
      isActive?: boolean;
      roomTypeId?: string;
    };

    const data: any = {};
    if (typeof roomNumber === 'string') data.roomNumber = roomNumber;
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (typeof roomTypeId === 'string') data.roomTypeId = roomTypeId;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update.' },
        { status: 400 },
      );
    }

    const room = await prisma.room.update({
      where: { id },
      data,
      include: {
        roomType: true,
      },
    });

    return NextResponse.json({ room });
  } catch (error) {
    console.error(`PATCH /api/admin/rooms/${id} error`, error);
    return NextResponse.json(
      { error: 'Failed to update room.' },
      { status: 500 },
    );
  }
}
