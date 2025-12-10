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
    // 该房型房间总数（这里不依赖 isActive 字段，如果你 schema 有 isActive，可以自己加上）
    const totalRooms = await prisma.room.count({
      where: {
        roomTypeId,
        // isActive: true,
      },
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
    // 仅用 Booking 表判断冲突，不再用 RoomBlockDate，避免 date 字段类型错误
    const activeBookingsCount = await prisma.booking.count({
      where: {
        roomTypeId,
        status: {
          in: ACTIVE_BOOKING_STATUSES,
        },
        NOT: {
          OR: [
            // 完全在入住前结束
            { checkOut: { lte: checkIn } },
            // 在退房后才入住
            { checkIn: { gte: checkOut } },
          ],
        },
      },
    });
    const usedRooms = activeBookingsCount;
    const availableRooms = Math.max(totalRooms - usedRooms, 0);
    const available = availableRooms > 0;
    const pricePerNight = roomType.basePrice;
    const totalPricePerRoom = pricePerNight * nights;
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