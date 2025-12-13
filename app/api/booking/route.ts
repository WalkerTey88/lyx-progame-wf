// app/api/booking/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureHitPayPaymentForBooking } from "@/lib/payment-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;

  // 兼容 date input: "YYYY-MM-DD"
  // 用 T00:00:00 避免不同运行时对纯日期字符串解析差异
  const normalized =
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;

  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function calculateNights(checkIn: Date, checkOut: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = checkOut.getTime() - checkIn.getTime();
  if (diff <= 0) return 0;
  return Math.round(diff / msPerDay);
}

// GET /api/booking?id=xxx  → 查单一订单（含 room / roomType / user）
// 兼容：GET /api/booking?bookingId=xxx（避免前端写错参数导致 400）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || searchParams.get("bookingId");

  if (!id) {
    return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      room: true,
      roomType: true,
      user: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ data: booking });
}

// POST /api/booking  → 创建预订
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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

    if (!roomTypeId || !checkIn || !checkOut || !guestName || !guestEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const checkInDate = parseDate(checkIn);
    const checkOutDate = parseDate(checkOut);

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json({ error: "Invalid checkIn or checkOut date" }, { status: 400 });
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: "checkOut must be after checkIn" }, { status: 400 });
    }

    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
    });

    if (!roomType) {
      return NextResponse.json({ error: "Invalid roomTypeId" }, { status: 400 });
    }

    const rooms = await prisma.room.findMany({
      where: { roomTypeId, isActive: true },
      orderBy: { roomNumber: "asc" },
    });

    if (!rooms.length) {
      return NextResponse.json(
        { error: "No active rooms for this room type" },
        { status: 409 },
      );
    }

    // 关键修复：PAYMENT_PENDING 也必须算“占用”，否则会超卖
    const statusesToBlock = ["PENDING", "PAYMENT_PENDING", "PAID", "COMPLETED"] as const;

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

    const nights = calculateNights(checkInDate, checkOutDate);
    const totalPrice = nights > 0 ? roomType.basePrice * nights : roomType.basePrice;

    let user = await prisma.user.findUnique({
      where: { email: guestEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: guestEmail,
          name: guestName,
          role: "GUEST",
        },
      });
    }

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

    const payment = await ensureHitPayPaymentForBooking({
      bookingId: booking.id,
      channel: "ONLINE",
      idempotencyKey: `HP:${booking.id}`,
    });

    return NextResponse.json(
      {
        data: booking,
        payment,
        checkoutUrl: payment.checkoutUrl,
        message: "Booking created. Redirecting to payment.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/booking] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}