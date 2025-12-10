// app/api/room-types/route.ts
import { NextResponse } from 'next/server';
import { getRoomTypesForBooking } from '@/lib/booking';

export async function GET() {
  try {
    const roomTypes = await getRoomTypesForBooking();
    return NextResponse.json({ roomTypes });
  } catch (error) {
    console.error('GET /api/room-types error', error);
    return NextResponse.json(
      { error: 'Failed to load room types.' },
      { status: 500 },
    );
  }
}
