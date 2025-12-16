// app/api/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Always dynamic
export const dynamic = "force-dynamic";

// 不再从 @prisma/client 导入 BookingStatus，避免 enum 不同步导致 TS 报错
const ACTIVE_BOOKING_STATUS = ["PENDING", "PAYMENT_PENDING", "PAID"] as const;

function isValidYMD(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const roomTypeId = searchParams.get("roomTypeId");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (!roomTypeId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing roomTypeId, checkIn or checkOut" },
        { status: 400 }
      );
    }

    if (!isValidYMD(checkIn) || !isValidYMD(checkOut)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const inDate = new Date(`${checkIn}T00:00:00.000Z`);
    const outDate = new Date(`${checkOut}T00:00:00.000Z`);

    if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
      return NextResponse.json({ error: "Invalid dates." }, { status: 400 });
    }

    if (outDate.getTime() <= inDate.getTime()) {
      return NextResponse.json(
        { error: "checkOut must be after checkIn." },
        { status: 400 }
      );
    }

    // 找到该房型可用房间：只要存在任意一间 room 在该区间没有“活跃订单”占用即可
    const rooms = await prisma.room.findMany({
      where: { roomTypeId, isActive: true },
      select: { id: true, roomNumber: true },
      orderBy: { roomNumber: "asc" },
    });

    if (rooms.length === 0) {
      return NextResponse.json(
        { ok: true, available: false, reason: "No active rooms for this room type." },
        { status: 200 }
      );
    }

    // 逐房间判断是否被占用（简单可靠，房量不大时足够）
    for (const r of rooms) {
      const count = await prisma.booking.count({
        where: {
          roomId: r.id,
          status: { in: [...ACTIVE_BOOKING_STATUS] as any },
          checkIn: { lt: outDate },
          checkOut: { gt: inDate },
        },
      });

      if (count === 0) {
        return NextResponse.json(
          { ok: true, available: true, room: { id: r.id, roomNumber: r.roomNumber } },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ ok: true, available: false }, { status: 200 });
  } catch (e: any) {
    console.error("[GET /api/availability] error:", e);
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}