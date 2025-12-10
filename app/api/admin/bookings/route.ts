// app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const ALLOWED_STATUSES = ["PENDING", "PAID", "CANCELLED", "COMPLETED"] as const;
type BookingStatusString = (typeof ALLOWED_STATUSES)[number];
// GET /api/admin/bookings
// 用于后台列表展示全部预订（含用户、房间、房型）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const where: any = {};
    if (status && ALLOWED_STATUSES.includes(status as BookingStatusString)) {
      where.status = status;
    }
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        room: true,
        roomType: true,
      },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[admin/bookings][GET] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}
// POST /api/admin/bookings
// 后台创建预订，逻辑与前台 create 接口类似，但给管理员用
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
    // 管理员创建预订时，同样按 email 复用 / 创建一个“联系人用户”，不用于前台登录
    let user = await prisma.user.findUnique({
      where: { email: guestEmail },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: guestEmail,
          name: guestName,
          // 不做登录账号，不写 password
          role: "GUEST", // 对应 UserRole.GUEST
        },
      });
    }
    const finalStatus: BookingStatusString =
      ALLOWED_STATUSES.includes(status as BookingStatusString)
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
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[admin/bookings][POST] error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
// PATCH /api/admin/bookings
// 更新预订状态（例如从 PENDING 改成 PAID / CANCELLED）
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, status } = body ?? {};
    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "Missing bookingId or status" },
        { status: 400 },
      );
    }
    if (!ALLOWED_STATUSES.includes(status as BookingStatusString)) {
      return NextResponse.json(
        { error: "Invalid booking status" },
        { status: 400 },
      );
    }
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
    return NextResponse.json(booking);
  } catch (error) {
    console.error("[admin/bookings][PATCH] error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}