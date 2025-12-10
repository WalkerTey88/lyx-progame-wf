// app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { BookingStatus } from '@prisma/client';

const ALLOWED_STATUSES: BookingStatus[] = [
  'PENDING',
  'PAID',
  'CANCELLED',
  'COMPLETED',
];

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

    const { status } = body as { status?: BookingStatus };

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error:
            'Invalid status. Allowed: PENDING, PAID, CANCELLED, COMPLETED.',
        },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status,
      },
      include: {
        user: true,
        room: {
          include: {
            roomType: true,
          },
        },
      },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error(`PATCH /api/admin/bookings/${id} error`, error);
    return NextResponse.json(
      { error: 'Failed to update booking.' },
      { status: 500 },
    );
  }
}
