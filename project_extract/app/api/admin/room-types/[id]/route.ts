// app/api/admin/room-types/[id]/route.ts
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

    const { name, description, basePrice, capacity } = body as {
      name?: string;
      description?: string | null;
      basePrice?: number;
      capacity?: number;
    };

    const data: any = {};
    if (typeof name === 'string') data.name = name;
    if (description !== undefined) data.description = description;
    if (typeof basePrice === 'number') data.basePrice = basePrice;
    if (typeof capacity === 'number') data.capacity = capacity;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update.' },
        { status: 400 },
      );
    }

    const roomType = await prisma.roomType.update({
      where: { id },
      data,
    });

    return NextResponse.json({ roomType });
  } catch (error) {
    console.error(`PATCH /api/admin/room-types/${id} error`, error);
    return NextResponse.json(
      { error: 'Failed to update room type.' },
      { status: 500 },
    );
  }
}
