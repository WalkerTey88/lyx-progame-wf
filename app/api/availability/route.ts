// app/api/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    // 现在 Room.id 是 String，直接用字符串
    const roomId = roomIdParam;
    const checkIn = new Date(checkInParam);
    const checkOut = new Date(checkOutParam);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: "Invalid checkIn or checkOut date" },
        { status: 400 }
      );
    }
    // 确认房间存在
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    // 查询有无与请求日期重叠的有效订单
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: {
          // 这里直接用字符串数组，类型上用 as any 规避枚举导入问题
          in: ACTIVE_BOOKING_STATUS as any,
        },
        AND: [
          { checkIn: { lt: checkOut } }, // existing.checkIn < requested.checkOut
          { checkOut: { gt: checkIn } }, // existing.checkOut > requested.checkIn
        ],
      },
    });
    // 查询封房日期（房间级 + 房型级）
    const overlappingBlocks = await prisma.roomBlockDate.findMany({
      where: {
        OR: [
          { roomId }, // 指定房间封锁
          { roomTypeId: room.roomTypeId }, // 整个房型封锁
        ],
        AND: [
          { startDate: { lt: checkOut } },
          { endDate: { gt: checkIn } },
        ],
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