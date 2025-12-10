// app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (from || to) {
      where.checkIn = {};
      if (from) where.checkIn.gte = new Date(from);
      if (to) where.checkIn.lte = new Date(to);
    }
    const [total, items] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          room: true,
          roomType: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return NextResponse.json({
      data: items,
      pagination: {
        page,
        pageSize,
        total,
      },
    });
  } catch (error) {
    console.error("[admin/bookings][GET] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}