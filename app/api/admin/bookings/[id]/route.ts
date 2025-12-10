// app/api/rooms/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
type Params = {
  params: {
    id: string;
  };
};
// GET /api/rooms/[id]
// 获取单个房间详情（含房型、预订、封房日期）
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const id = params.id; // Room.id 是 String，不要再 Number()
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        roomType: true,
        bookings: true,
        blockDates: true,
      },
    });
    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(room);
  } catch (error) {
    console.error("[rooms/[id]] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 },
    );
  }
}