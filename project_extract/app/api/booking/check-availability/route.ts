// app/api/bookings/check-availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | {
        roomTypeId?: string;
        checkIn?: string;
        checkOut?: string;
      }
    | null;

  const roomTypeId = body?.roomTypeId;
  const checkIn = parseDate(body?.checkIn);
  const checkOut = parseDate(body?.checkOut);

  if (!roomTypeId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "roomTypeId, checkIn, checkOut are required." },
      { status: 400 }
    );
  }

  if (checkOut <= checkIn) {
    return NextResponse.json(
      { error: "checkOut must be after checkIn." },
      { status: 400 }
    );
  }

  const nights =
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);

  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
  });

  if (!roomType) {
    return NextResponse.json({ error: "Invalid roomTypeId." }, { status: 400 });
  }

  const rooms = await prisma.room.findMany({
    where: {
      roomTypeId,
      isActive: true,
    },
  });

  if (!rooms.length) {
    return NextResponse.json(
      { available: false, reason: "No active rooms for this room type." },
      { status: 200 }
    );
  }

  const statusesToBlock = ["PENDING", "PAID", "COMPLETED"] as const;

  for (const room of rooms) {
    const overlapping = await prisma.booking.count({
      where: {
        roomId: room.id,
        status: { in: statusesToBlock as any },
        AND: [
          { checkIn: { lt: checkOut } }, // 这里改成 lt
          { checkOut: { gt: checkIn } }, // 这里改成 gt
        ],
      },
    });

    if (overlapping === 0) {
      const totalPrice = roomType.basePrice * nights;

      return NextResponse.json({
        available: true,
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomType: {
          id: roomType.id,
          name: roomType.name,
        },
        nights,
        totalPrice,
      });
    }
  }

  return NextResponse.json(
    {
      available: false,
      reason: "No rooms available for the selected dates.",
    },
    { status: 200 }
  );
}