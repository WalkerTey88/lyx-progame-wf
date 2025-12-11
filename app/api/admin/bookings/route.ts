// app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN || "";

export const runtime = "nodejs";
// 显式声明为动态，避免静态分析时报 DYNAMIC_SERVER_USAGE
export const dynamic = "force-dynamic";
export const revalidate = 0;

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

function requireAdmin(req: NextRequest): NextResponse | null {
  if (!ADMIN_API_TOKEN) {
    return NextResponse.json(
      { error: "ADMIN_API_TOKEN is not configured" },
      { status: 500 },
    );
  }

  const token = req.headers.get("x-admin-token");
  if (!token || token !== ADMIN_API_TOKEN) {
    return unauthorized();
  }

  return null;
}

export async function GET(req: NextRequest) {
  const notOk = requireAdmin(req);
  if (notOk) return notOk;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const pageSize = Math.max(
    1,
    Math.min(100, Number(searchParams.get("pageSize") || "10") || 10),
  );

  const skip = (page - 1) * pageSize;

  const [total, items] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        room: true,
        roomType: true,
        user: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  return NextResponse.json({
    data: items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  });
}