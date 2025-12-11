// app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function assertAdmin(req: NextRequest) {
  const headerToken = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_API_TOKEN;

  if (!expected) {
    throw Object.assign(new Error("ADMIN_API_TOKEN is not configured"), {
      status: 500,
    });
  }

  if (!headerToken || headerToken !== expected) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
}

// GET /api/admin/bookings
// 支持查询参数：
//   page        (默认 1)
//   pageSize    (默认 20)
//   status      (PENDING | PAID | CANCELLED | COMPLETED)
//   roomTypeId
//   from        (ISO 日期字符串，过滤 checkIn >= from)
//   to          (ISO 日期字符串，过滤 checkIn <= to)
export async function GET(req: NextRequest) {
  try {
    assertAdmin(req);

    const { searchParams } = new URL(req.url);

    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "20", 10);
    const statusParam = searchParams.get("status");
    const roomTypeId = searchParams.get("roomTypeId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {};

    if (statusParam) {
      const upper = statusParam.toUpperCase();
      if ((Object.values(BookingStatus) as string[]).includes(upper)) {
        where.status = upper as BookingStatus;
      }
    }

    if (roomTypeId) {
      where.roomTypeId = roomTypeId;
    }

    if (from || to) {
      const checkIn: any = {};
      if (from) {
        const d = new Date(from);
        if (!Number.isNaN(d.getTime())) {
          checkIn.gte = d;
        }
      }
      if (to) {
        const d = new Date(to);
        if (!Number.isNaN(d.getTime())) {
          checkIn.lte = d;
        }
      }
      if (Object.keys(checkIn).length > 0) {
        where.checkIn = checkIn;
      }
    }

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize =
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100
        ? pageSize
        : 20;

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
        include: {
          room: true,
          roomType: true,
          user: true,
        },
      }),
    ]);

    const totalPages =
      safePageSize === 0 ? 0 : Math.ceil(total / safePageSize) || 1;

    return NextResponse.json({
      data: bookings,
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/bookings error:", error);

    const status = error?.status ?? 500;
    const message =
      status === 401
        ? "Unauthorized"
        : status === 500
          ? "Internal server error"
          : error?.message || "Unexpected error";

    return jsonError(message, status);
  }
}