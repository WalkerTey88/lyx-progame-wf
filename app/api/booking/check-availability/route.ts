// app/api/booking/check-availability/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 明确声明动态 Route，避免 Next/Vercel 试图做静态优化
export const dynamic = "force-dynamic";

// 视为“占用”的订单状态（和 /api/booking 逻辑保持一致）
const ACTIVE_BOOKING_STATUSES = ["PENDING", "PAID"] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const roomTypeId = searchParams.get("roomTypeId");
    const checkInStr = searchParams.get("checkIn");
    const checkOutStr = searchParams.get("checkOut");

    if (!roomTypeId || !checkInStr || !checkOutStr) {
      return NextResponse.json(
        { error: "Missing roomTypeId, checkIn or checkOut" },
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

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: "checkOut must be after checkIn" },
        { status: 400 }
      );
    }

    // 1）拿到这个房型下所有启用中的房间
    const rooms = await prisma.room.findMany({
      where: {
        roomTypeId,
        isActive: true,
      },
      orderBy: { roomNumber: "asc" },
    });

    if (rooms.length === 0) {
      return NextResponse.json({
        available: false,
        reason: "NO_ACTIVE_ROOMS",
      });
    }

    const roomIds = rooms.map((r) => r.id);

    // 2）查有无与时间段重叠的有效订单
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        roomId: { in: roomIds },
        status: {
          in: ACTIVE_BOOKING_STATUSES as any,
        },
        AND: [
          { checkIn: { lt: checkOut } }, // existing.checkIn < requested.checkOut
          { checkOut: { gt: checkIn } }, // existing.checkOut > requested.checkIn
        ],
      },
      select: { roomId: true },
    });

    // 3）查封房日期（房间级 + 房型级），你的 RoomBlockDate 只有一个 date 字段
    const overlappingBlocks = await prisma.roomBlockDate.findMany({
      where: {
        OR: [
          { roomId: { in: roomIds } },
          { roomTypeId },
        ],
        date: {
          gte: checkIn,
          lt: checkOut,
        },
      },
      select: { roomId: true },
    });

    const bookedRoomIds = new Set(
      overlappingBookings
        .map((b) => b.roomId)
        .filter((id): id is string => !!id)
    );

    const blockedRoomIds = new Set(
      overlappingBlocks
        .map((b) => b.roomId)
        .filter((id): id is string => !!id)
    );

    // 4）挑一个既没被预订也没被封的房间
    const availableRoom = rooms.find(
      (r) => !bookedRoomIds.has(r.id) && !blockedRoomIds.has(r.id)
    );

    if (!availableRoom) {
      return NextResponse.json({ available: false });
    }

    // 5）算价格（用 RoomType.basePrice * 晚数）
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
    });

    const msPerNight = 1000 * 60 * 60 * 24;
    const nightsRaw = (checkOut.getTime() - checkIn.getTime()) / msPerNight;
    const nights = Math.max(1, Math.round(nightsRaw));

    const nightlyPrice = roomType?.basePrice ?? 0;
    const totalPrice = nightlyPrice * nights;

    return NextResponse.json({
      available: true,
      roomId: availableRoom.id,
      nights,
      nightlyPrice,
      totalPrice,
    });
  } catch (error) {
    console.error("[booking/check-availability] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}