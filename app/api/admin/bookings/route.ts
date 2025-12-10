// app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/bookings
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as
      | "PENDING"
      | "PAID"
      | "CANCELLED"
      | "COMPLETED"
      | null;

    const where =
      status && ["PENDING", "PAID", "CANCELLED", "COMPLETED"].includes(status)
        ? { status }
        : {};

    const bookings = await prisma.booking.findMany({
      where,
      // 注意：这里改成按 checkIn 排序，不再用 createdAt
      orderBy: { checkIn: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (err) {
    console.error("[ADMIN_BOOKINGS_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to load bookings." },
      { status: 500 }
    );
  }
}