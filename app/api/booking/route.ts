// app/api/booking/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 工具：安全解析日期
function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// 工具：计算晚数（checkOut 当天不住）
function calculateNights(checkIn: Date, checkOut: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = checkOut.getTime() - checkIn.getTime();
  if (diff <= 0) return 0;
  return Math.round(diff / msPerDay);
}

// GET /api/booking?id=xxx  → 查单一订单（含 room / roomType / user）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing booking id" },
      { status: 400 },
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      room: true,
      roomType: true,
      user: true,
    },
  });

  if (!booking) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: booking });
}

// POST /api/booking  → 创建预订
// 预期 body：{
//   roomTypeId, checkIn, checkOut,
//   guestName, guestEmail, guestPhone?, specialRequest?
// }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const {
      roomTypeId,
      checkIn,
      checkOut,
      guestName,
      guestEmail,
      guestPhone,
      specialRequest,
    } = body as {
      roomTypeId?: string;
      checkIn?: string;
      checkOut?: string;
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
      specialRequest?: string;
    };

    // 基础字段校验
    if (!roomTypeId || !checkIn || !checkOut || !guestName || !guestEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const checkInDate = parseDate(checkIn);
    const checkOutDate = parseDate(checkOut);

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "Invalid checkIn or checkOut date" },
        { status: 400 },
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "checkOut must be after checkIn" },
        { status: 400 },
      );
    }

    // 1. 取房型
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
    });

    if (!roomType) {
      return NextResponse.json(
        { error: "Invalid roomTypeId" },
        { status: 400 },
      );
    }

    // 2. 找一个可用房间（只选 isActive = true）
    const rooms = await prisma.room.findMany({
      where: {
        roomTypeId,
        isActive: true,
      },
      orderBy: {
        roomNumber: "asc",
      },
    });

    if (!rooms.length) {
      return NextResponse.json(
        { error: "No active rooms for this room type" },
        { status: 409 },
      );
    }

    const statusesToBlock = ["PENDING", "PAID", "COMPLETED"] as const;

    let selectedRoom: (typeof rooms)[number] | null = null;

    for (const room of rooms) {
      const overlapping = await prisma.booking.count({
        where: {
          roomId: room.id,
          status: { in: statusesToBlock as any },
          AND: [
            { checkIn: { lt: checkOutDate } },
            { checkOut: { gt: checkInDate } },
          ],
        },
      });

      if (overlapping === 0) {
        selectedRoom = room;
        break;
      }
    }

    if (!selectedRoom) {
      return NextResponse.json(
        { error: "No rooms available for the selected dates" },
        { status: 409 },
      );
    }

    // 3. 计算价格（按房型 basePrice × 晚数）
    const nights = calculateNights(checkInDate, checkOutDate);
    const totalPrice =
      nights > 0 ? roomType.basePrice * nights : roomType.basePrice;

    // 4. 用 guestEmail 找或建一个 User（仅做联系人，不开放前台登录）
    let user = await prisma.user.findUnique({
      where: { email: guestEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: guestEmail,
          name: guestName,
          // 不做前台登录账户，password 为空
          role: "GUEST",
        },
      });
    }

    // 5. 创建 Booking（默认 status = PENDING）
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        roomId: selectedRoom.id,
        roomTypeId,
        guestName,
        guestEmail,
        guestPhone: guestPhone ?? "",
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        status: "PENDING",
        specialRequest: specialRequest || null,
      },
      include: {
        room: true,
        roomType: true,
        user: true,
      },
    });

    return NextResponse.json(
      {
        data: booking,
        message: "Booking created. Proceed to payment.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/booking] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
} sts