// app/api/admin/bookings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = ["PENDING", "PAID", "CANCELLED", "COMPLETED"] as const;
type BookingStatusString = (typeof ALLOWED_STATUSES)[number];

// GET /api/admin/bookings
// 后台列表全部预订（含用户、房间、房型）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: { status?: BookingStatusString } = {};
    if (status && ALLOWED_STATUSES.includes(status as BookingStatusString)) {
      where.status = status as BookingStatusString;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        room: {
          include: {
            roomType: true,
          },
        },
        roomType: true,
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("[admin/bookings][GET] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

// POST /api/admin/bookings
// 后台创建预订
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roomId,
      roomTypeId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      totalPrice,
      status,
    } = body ?? {};

    if (
      !roomId ||
      !roomTypeId ||
      !guestName ||
      !guestEmail ||
      !checkIn ||
      !checkOut
    ) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 },
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      return NextResponse.json(
        { error: "Invalid checkIn or checkOut date" },
        { status: 400 },
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 },
      );
    }

    // 管理员创建预订：按 email 复用 / 创建联系人用户
    let user = await prisma.user.findUnique({
      where: { email: guestEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: guestEmail,
          name: guestName,
          // 不做前台登录账号，不写 password
          role: "GUEST",
        },
      });
    }

    const finalStatus: BookingStatusString = ALLOWED_STATUSES.includes(
      status as BookingStatusString,
    )
      ? (status as BookingStatusString)
      : "PENDING";

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        roomId,
        roomTypeId,
        guestName,
        guestEmail,
        guestPhone: guestPhone ?? "",
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice: Number(totalPrice ?? 0),
        status: finalStatus,
      },
      include: {
        user: true,
        room: {
          include: {
            roomType: true,
          },
        },
        roomType: true,
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("[admin/bookings][POST] error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
