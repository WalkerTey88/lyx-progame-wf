// app/api/booking/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus, Prisma } from "@prisma/client";

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "PAID",
  "COMPLETED",
];

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffNights(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  const nights = Math.round(ms / (1000 * 60 * 60 * 24));
  return nights;
}

async function calculateTotalPrice(
  tx: Prisma.TransactionClient,
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  basePrice: number,
): Promise<{ nights: number; totalPrice: number }> {
  const nights = diffNights(checkIn, checkOut);

  const priceRows = await tx.priceCalendar.findMany({
    where: {
      roomTypeId,
      date: {
        gte: checkIn,
        lt: checkOut,
      },
    },
  });

  const priceMap = new Map<string, number>();
  for (const row of priceRows) {
    const key = row.date.toISOString().slice(0, 10);
    priceMap.set(key, row.price);
  }

  let totalPrice = 0;
  let cursor = new Date(checkIn);

  for (let i = 0; i < nights; i++) {
    const key = cursor.toISOString().slice(0, 10);
    const price = priceMap.get(key) ?? basePrice;
    totalPrice += price;
    cursor.setDate(cursor.getDate() + 1);
  }

  return { nights, totalPrice };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const roomTypeId = body?.roomTypeId as string | undefined;
    const guests = Number(body?.guests ?? 0);

    const guestName = (body?.guestName as string | undefined)?.trim();
    const guestEmail = (body?.guestEmail as string | undefined)?.trim();
    const guestPhone = (body?.guestPhone as string | undefined)?.trim();
    const specialRequest =
      (body?.specialRequest as string | undefined)?.trim() || undefined;

    const checkIn = parseDate(body?.checkIn);
    const checkOut = parseDate(body?.checkOut);

    if (!roomTypeId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "roomTypeId, checkIn, checkOut are required" },
        { status: 400 },
      );
    }

    if (!guestName || !guestEmail || !guestPhone) {
      return NextResponse.json(
        { error: "guestName, guestEmail, guestPhone are required" },
        { status: 400 },
      );
    }

    const nights = diffNights(checkIn, checkOut);
    if (nights <= 0) {
      return NextResponse.json(
        { error: "checkOut must be later than checkIn" },
        { status: 400 },
      );
    }

    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
    });

    if (!roomType) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 },
      );
    }

    if (guests <= 0 || guests > roomType.capacity) {
      return NextResponse.json(
        { error: "Invalid guest count for this room type" },
        { status: 400 },
      );
    }

    const booking = await prisma.$transaction(async (tx) => {
      const rooms = await tx.room.findMany({
        where: {
          roomTypeId,
          isActive: true,
        },
      });

      if (!rooms.length) {
        throw new Error("NO_ACTIVE_ROOMS");
      }

      let selectedRoom: (typeof rooms)[number] | null = null;

      for (const room of rooms) {
        const conflictingBookings = await tx.booking.count({
          where: {
            roomId: room.id,
            status: { in: ACTIVE_BOOKING_STATUSES },
            NOT: {
              OR: [
                { checkOut: { lte: checkIn } },
                { checkIn: { gte: checkOut } },
              ],
            },
          },
        });

        if (conflictingBookings > 0) continue;

        selectedRoom = room;
        break;
      }

      if (!selectedRoom) {
        throw new Error("NO_AVAILABLE_ROOM");
      }

      const { totalPrice } = await calculateTotalPrice(
        tx,
        roomTypeId,
        checkIn,
        checkOut,
        roomType.basePrice,
      );

      const created = await tx.booking.create({
        data: {
          roomId: selectedRoom.id,
          roomTypeId,
          guestName,
          guestEmail,
          guestPhone,
          checkIn,
          checkOut,
          totalPrice,
          status: "PENDING",
          // specialRequest 不写入 DB，避免类型错误
        },
      });

      // 把 specialRequest 一并带回给前端（仅响应，不入库）
      return {
        ...created,
        specialRequest,
      };
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("[booking/create] error:", error);

    if (error instanceof Error) {
      if (error.message === "NO_ACTIVE_ROOMS") {
        return NextResponse.json(
          { error: "No active rooms for this room type" },
          { status: 409 },
        );
      }
      if (error.message === "NO_AVAILABLE_ROOM") {
        return NextResponse.json(
          { error: "No available room for selected dates" },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}