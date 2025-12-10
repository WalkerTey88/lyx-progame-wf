// app/api/booking/create/route.ts
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
    // 获取该房型全部房间（不强制 isActive，和你当前 schema 对齐）
    const rooms = await prisma.room.findMany({
      where: {
        roomTypeId,
        // isActive: true,
      },
    });
    if (!rooms.length) {
      return NextResponse.json(
        { error: "No active rooms for this room type" },
        { status: 409 },
      );
    }
    // 逐个房间检查是否有冲突订单（只用 Booking，不用 BlockDate）
    let selectedRoom: (typeof rooms)[number] | null = null;
    for (const room of rooms) {
      const conflictingBookings = await prisma.booking.count({
        where: {
          roomId: room.id,
          status: {
            in: ACTIVE_BOOKING_STATUSES,
          },
          NOT: {
            OR: [
              { checkOut: { lte: checkIn } },
              { checkIn: { gte: checkOut } },
            ],
          },
        },
      });
      if (conflictingBookings > 0) {
        continue;
      }
      selectedRoom = room;
      break;
    }
    if (!selectedRoom) {
      return NextResponse.json(
        { error: "No available room for selected dates" },
        { status: 409 },
      );
    }
    const pricePerNight = roomType.basePrice;
    const totalPrice = pricePerNight * nights;
    // 注意：这里只写入 schema 里肯定存在的字段，不包含 specialRequest
    const booking = await prisma.booking.create({
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
        // 如果以后在 schema 里加了 specialRequest，再把这一行打开：
        // specialRequest,
      },
    });
    // 返回时把 specialRequest 携带给前端（仅用来显示，不在 DB 中持久化）
    return NextResponse.json(
      { ...booking, specialRequest },
      { status: 201 },
    );
  } catch (error) {
    console.error("[booking/create] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}