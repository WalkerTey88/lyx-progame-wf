// app/api/bookings/create/route.ts
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
        name?: string;
        email?: string;
        phone?: string;
        roomTypeId?: string;
        checkIn?: string;
        checkOut?: string;
        notes?: string;
      }
    | null;

  const name = body?.name?.trim() || "";
  const email = body?.email?.trim() || "";
  const roomTypeId = body?.roomTypeId;
  const checkIn = parseDate(body?.checkIn);
  const checkOut = parseDate(body?.checkOut);

  if (!name || !email || !roomTypeId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "name, email, roomTypeId, checkIn, checkOut are required." },
      { status: 400 }
    );
  }

  if (checkOut <= checkIn) {
    return NextResponse.json(
      { error: "checkOut must be after checkIn." },
      { status: 400 }
    );
  }

  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
  });

  if (!roomType) {
    return NextResponse.json({ error: "Invalid roomTypeId." }, { status: 400 });
  }

  const nights =
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
  const totalPrice = roomType.basePrice * nights;

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
    },
    create: {
      email,
      name,
      password: "!", // 不用于前台登录
      role: "USER",
    },
  });

  const rooms = await prisma.room.findMany({
    where: {
      roomTypeId,
      isActive: true,
    },
  });

  if (!rooms.length) {
    return NextResponse.json(
      { error: "No active rooms for this room type." },
      { status: 400 }
    );
  }

  const statusesToBlock = ["PENDING", "PAID", "COMPLETED"] as const;
  let selectedRoomId: string | null = null;

  for (const room of rooms) {
    const overlapping = await prisma.booking.count({
      where: {
        roomId: room.id,
        status: { in: statusesToBlock as any },
        AND: [
          { checkIn: { lt: checkOut } }, // 这里同样改成 lt
          { checkOut: { gt: checkIn } }, // 这里改成 gt
        ],
      },
    });

    if (overlapping === 0) {
      selectedRoomId = room.id;
      break;
    }
  }

  if (!selectedRoomId) {
    return NextResponse.json(
      { error: "No rooms available for the selected dates." },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      roomId: selectedRoomId,
      checkIn,
      checkOut,
      totalPrice,
      status: "PENDING",
    },
    include: {
      room: {
        include: { roomType: true },
      },
      user: true,
    },
  });

  return NextResponse.json({ booking }, { status: 201 });
}