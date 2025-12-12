// app/api/availability/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 告诉 Next：这个 Route 永远是动态，别尝试做静态优化
export const dynamic = "force-dynamic";

// 用字符串常量表示“占用状态”，避免从 @prisma/client 导入 BookingStatus 枚举
const ACTIVE_BOOKING_STATUS = ["PENDING", "PAID"] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const roomIdParam = searchParams.get("roomId");
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");

    if (!roomIdParam || !checkInParam || !checkOutParam) {
      return NextResponse.json(
        { error: "Missing roomId, checkIn or checkOut" },
        { status: 400 }
      );
    }

    const roomId = roomIdParam;
    const checkIn = new Date(checkInParam);
    const checkOut = new Date(checkOutParam);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: "Invalid checkIn or checkOut date" },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: "checkOut must be after checkIn" },
        { status: 400 }
      );
    }

    // 1）确认房间存在
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 2）查是否有与请求日期重叠的有效订单
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: {
          in: ACTIVE_BOOKING_STATUS as any,
        },
        AND: [
          { checkIn: { lt: checkOut } }, // existing.checkIn < requested.checkOut
          { checkOut: { gt: checkIn } }, // existing.checkOut > requested.checkIn
        ],
      },
    });

    // 3）查封房日期（房间级 + 房型级），你的模型只有 date 字段
    const overlappingBlocks = await prisma.roomBlockDate.findMany({
      where: {
        OR: [{ roomId }, { roomTypeId: room.roomTypeId }],
        date: {
          gte: checkIn,
          lt: checkOut,
        },
      },
    });

    const isAvailable =
      overlappingBookings.length === 0 && overlappingBlocks.length === 0;

    return NextResponse.json({ available: isAvailable });
  } catch (error) {
    console.error("[availability] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}