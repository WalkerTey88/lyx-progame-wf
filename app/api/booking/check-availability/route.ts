// app/api/booking/check-availability/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 只允许这两种状态算“占用”
const ACTIVE_BOOKING_STATUS: ("PENDING" | "PAID")[] = ["PENDING", "PAID"];

interface CheckAvailabilityBody {
  roomTypeId: string;
  checkIn: string;   // ISO, e.g. "2025-12-12"
  checkOut: string;  // ISO
  quantity?: number; // 需要的房间数量，默认 1
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CheckAvailabilityBody>;

    const roomTypeId = body.roomTypeId;
    const checkInStr = body.checkIn;
    const checkOutStr = body.checkOut;
    const quantity = body.quantity ?? 1;

    // 1. 参数校验
    if (!roomTypeId || !checkInStr || !checkOutStr) {
      return NextResponse.json(
        { error: "Missing roomTypeId, checkIn or checkOut" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "quantity must be greater than 0" },
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

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: "checkIn must be earlier than checkOut" },
        { status: 400 }
      );
    }

    // 2. 获取该房型下所有启用中的房间
    const rooms = await prisma.room.findMany({
      where: {
        roomTypeId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (rooms.length === 0) {
      return NextResponse.json(
        { error: "No active rooms for this roomType" },
        { status: 404 }
      );
    }

    const roomIds = rooms.map((r) => r.id);

    // 3. 查询这段时间内所有“占用”状态的预订
    // 区间重叠条件：[A,B) 与 [C,D) 重叠 ⇔ A < D 且 C < B
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        roomId: { in: roomIds },
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
      select: {
        roomId: true,
      },
    });

    // 4. 计算已被占用的房间数量（按房间去重）
    const bookedRoomIdSet = new Set<string>(
      overlappingBookings.map((b) => b.roomId)
    );

    const totalRooms = rooms.length;
    const bookedRooms = bookedRoomIdSet.size;
    const availableRooms = totalRooms - bookedRooms;

    const isAvailable = availableRooms >= quantity;

    return NextResponse.json(
      {
        available: isAvailable,
        totalRooms,
        bookedRooms,
        availableRooms,
        requiredRooms: quantity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CHECK_AVAILABILITY_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}