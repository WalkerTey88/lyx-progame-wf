import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ACTIVE_BOOKING_STATUS = ["PENDING", "PAID"] as const;

// 这个 API 需要根据请求参数动态计算，明确标记为动态，避免被静态预渲染
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const checkInStr = searchParams.get("checkIn");
    const checkOutStr = searchParams.get("checkOut");

    if (!roomId || !checkInStr || !checkOutStr) {
      return NextResponse.json(
        { error: "Missing roomId, checkIn or checkOut" },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: "Invalid checkIn or checkOut date" },
        { status: 400 }
      );
    }

    // Room.id 是 String，直接用字符串
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 查找有时间重叠的有效订单
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: {
          // 这里直接用字符串数组，类型层用 any 处理枚举
          in: ACTIVE_BOOKING_STATUS as any,
        },
        AND: [
          {
            checkIn: {
              lt: checkOut, // existing.checkIn < requested.checkOut
            },
          },
          {
            checkOut: {
              gt: checkIn, // existing.checkOut > requested.checkIn
            },
          },
        ],
      },
    });

    // 查找封锁日期（房间级 + 房型级）
    const overlappingBlocks = await prisma.roomBlockDate.findMany({
      where: {
        OR: [
          { roomId }, // 针对单个房间封锁
          { roomTypeId: room.roomTypeId }, // 整个房型封锁
        ],
        AND: [
          {
            startDate: {
              lt: checkOut,
            },
          },
          {
            endDate: {
              gt: checkIn,
            },
          },
        ],
      },
    });

    const available =
      overlappingBookings.length === 0 && overlappingBlocks.length === 0;

    return NextResponse.json({ available });
  } catch (error) {
    console.error("[availability] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
