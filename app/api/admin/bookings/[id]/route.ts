// app/api/admin/bookings/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = ["PENDING", "PAID", "CANCELLED", "COMPLETED"] as const;
type BookingStatusString = (typeof ALLOWED_STATUSES)[number];

type RouteContext = {
  params: {
    id: string;
  };
};

// GET /api/admin/bookings/[id]
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const id = params.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        room: {
          include: {
            roomType: true,
          },
        },
        roomType: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("[admin/bookings/[id]][GET] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/bookings/[id]
// 更新预订状态（例如从 PENDING 改成 PAID / CANCELLED / COMPLETED）
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
) {
  const id = params.id;

  try {
    const body = await req.json();
    const { status } = body ?? {};

    if (!status) {
      return NextResponse.json(
        { error: "Missing status" },
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
      where: { id },
      data: { status: status as BookingStatusString },
      include: {
        user: true,
        room: {
          include: {
            roomType: true,
          },
        },
        roomType: true,
      },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("[admin/bookings/[id]][PATCH] error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
