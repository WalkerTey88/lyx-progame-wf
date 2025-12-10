// app/api/booking/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    } = body ?? {};
    // 基础参数校验
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
    // 校验房间存在
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 },
      );
    }
    // 用 email 找“联系人用户”，没有就创建一个
    let user = await prisma.user.findUnique({
      where: { email: guestEmail },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: guestEmail,
          name: guestName,
          // 不做前台登陆账号，不写 password
          role: "GUEST", // 对应 schema 里的 UserRole.GUEST
        },
      });
    }
    // 创建预订
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
        status: "PENDING", // BookingStatus 枚举里的值，直接用字符串
      },
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[booking/create] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}