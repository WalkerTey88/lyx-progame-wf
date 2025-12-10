// app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
type RouteParams = {
  params: { id: string };
};
// GET /api/admin/bookings/[id]  获取详情
export async function GET(req: NextRequest, { params }: RouteParams) {
  const authError = requireAdmin(req);
  if (authError) return authError;
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
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
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
// PATCH /api/admin/bookings/[id]  更新状态 / 备注
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const status = body?.status as BookingStatus | undefined;
    const specialRequest =
      (body?.specialRequest as string | undefined)?.trim() || undefined;
    const data: any = {};
    if (status) data.status = status;
    if (specialRequest !== undefined) data.specialRequest = specialRequest;
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/bookings/[id]][PATCH] error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}