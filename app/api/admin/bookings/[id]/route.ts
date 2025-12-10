// app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
type RouteParams = {
  params: { id: string };
};
// GET /api/admin/bookings/[id]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        room: true,
        roomType: true,
      },
    });
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(booking);
  } catch (error) {
    console.error("[admin/bookings/[id]][GET] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}