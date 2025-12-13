// app/api/availability/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

// Tell Next: this route is always dynamic (avoid static caching)
export const dynamic = "force-dynamic";

// Booking statuses that should block availability
const ACTIVE_BOOKING_STATUS: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.PAYMENT_PENDING,
  BookingStatus.PAID,
  BookingStatus.COMPLETED,
];

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

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: "checkIn must be earlier than checkOut" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room || !room.isActive) {
      return NextResponse.json(
        { error: "Room not found or inactive" },
        { status: 404 }
      );
    }

    // Overlap rule:
    // existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ACTIVE_BOOKING_STATUS },
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } },
        ],
      },
      select: { id: true },
    });

    const isAvailable = overlappingBookings.length === 0;

    return NextResponse.json(
      {
        available: isAvailable,
        conflicts: {
          bookings: overlappingBookings.length,
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