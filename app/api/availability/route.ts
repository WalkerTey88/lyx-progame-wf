// app/api/availability/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 告诉 Next：这个 Route 永远是动态，避免静态缓存
export const dynamic = "force-dynamic";

// 使用普通可变数组，而不是 readonly
const ACTIVE_BOOKING_STATUS: ("PENDING" | "PAID")[] = ["PENDING", "PAID"];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const roomIdParam = searchParams.get("roomId");
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");

    // 1. 参数校验
    if (!roomIdParam || !checkInParam || !checkOutParam) {
      return NextResponse.json(
        { error: "Missing roomId, checkIn or checkOut" },
        { status: 400 }
      );
    }

    const roomId = roomIdParam;
    const checkIn = new Date(checkInParam);
    const checkOut = new Date(checkOutParam);

    // 日期是否合法
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: "Invalid checkIn or checkOut date" },
        { status: 400 }
      );
    }

    // 入住时间必须早于退房时间
    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: "checkIn must be earlier than checkOut" },
        { status: 400 }
      );
    }

    // 2. 房间是否存在 + 是否启用
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room || !room.isActive) {
      return NextResponse.json(
        { error: "Room not found or inactive" },
        { status: 404 }
      );
    }

    // 3. 是否有重叠 Booking（PENDING / PAID）
    // 区间重叠条件：[A,B) 与 [C,D) 重叠 ⇔ A < D 且 C < B
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ACTIVE_BOOKING_STATUS },
        AND: [
          {
            checkIn: {
              lt: checkOut,
            },
          },
          {
            checkOut: {
              gt: checkIn,
            },
          },
        ],
      },
    });

    // 当前版本：只基于 Booking 判断是否可订
    const isAvailable = overlappingBookings.length === 0;

    return NextResponse.json(
      {
        available: isAvailable,
        conflicts: {
          bookings: overlappingBookings.length,
          // 封房逻辑后续根据你的 RoomBlockDate 模型再补
          blockDates: 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AVAILABILITY_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
