// app/api/booking/check-availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const roomTypeId = body?.roomTypeId as string | undefined;
    const guests = Number(body?.guests ?? 0);

    const checkIn = parseDate(body?.checkIn);
    const checkOut = parseDate(body?.checkOut);

    if (!roomTypeId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "roomTypeId, checkIn, checkOut are required" },
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

    if (guests > 0 && guests > roomType.capacity) {
      return NextResponse.json(
        { error: "Guest count exceeds room type capacity" },
        { status: 400 },
      );
    }

    // 房型可用房间总数
    const totalRooms = await prisma.room.count({
      where: { roomTypeId, isActive: true },
    });

    if (totalRooms === 0) {
      return NextResponse.json({
        available: false,
        availableRooms: 0,
        nights,
        pricePerNight: roomType.basePrice,
        totalPricePerRoom: nights * roomType.basePrice,
      });
    }

    // 当前时间段内，该房型已有订单数量（简化：1 订单占 1 间房）
    const activeBookingsCount = await prisma.booking.count({
      where: {
        roomTypeId,
        status: { in: ACTIVE_BOOKING_STATUSES },
        NOT: {
          OR: [
            { checkOut: { lte: checkIn } },
            { checkIn: { gte: checkOut } },
          ],
        },
      },
    });

    const usedRooms = activeBookingsCount;
    const availableRooms = Math.max(totalRooms - usedRooms, 0);
    const available = availableRooms > 0;

    // 按 PriceCalendar 计算价格（没有记录就用 basePrice）
    const priceRows = await prisma.priceCalendar.findMany({
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

    let totalPricePerRoom = 0;
    let cursor = new Date(checkIn);

    for (let i = 0; i < nights; i++) {
      const key = cursor.toISOString().slice(0, 10);
      const price = priceMap.get(key) ?? roomType.basePrice;
      totalPricePerRoom += price;
      cursor.setDate(cursor.getDate() + 1);
    }

    const pricePerNight = Math.round(totalPricePerRoom / nights);

    return NextResponse.json({
      available,
      availableRooms,
      nights,
      pricePerNight,
      totalPricePerRoom,
    });
  } catch (error) {
    console.error("[booking/check-availability] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}