// app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// 本地定义 BookingStatus（避免直接从 @prisma/client 导入枚举）
const BOOKING_STATUS_VALUES = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PAYMENT_FAILED",
  "EXPIRED",
  "CANCELLED",
  "COMPLETED",
] as const;

type BookingStatus = (typeof BOOKING_STATUS_VALUES)[number];

// GET /api/admin/bookings/:id
export async function GET(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    const id = context.params.id;
    if (!id) {
      return jsonError("Missing booking id", 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        roomType: true,
        user: true,
      },
    });

    if (!booking) {
      return jsonError("Booking not found", 404);
    }

    return NextResponse.json({ data: booking });
  } catch (error: any) {
    console.error("GET /api/admin/bookings/[id] error:", error);
    return jsonError("Internal server error", 500);
  }
}

// PATCH /api/admin/bookings/:id
// 用于更新订单状态 / 备注（specialRequest）以及基础联系人字段
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    const id = context.params.id;
    if (!id) {
      return jsonError("Missing booking id", 400);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const {
      status,
      specialRequest,
      guestName,
      guestEmail,
      guestPhone,
    } = body as {
      status?: string;
      specialRequest?: string | null;
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
    };

    const data: any = {};

    if (status !== undefined) {
      const upper = String(status).toUpperCase() as BookingStatus;
      if (!BOOKING_STATUS_VALUES.includes(upper)) {
        return jsonError(
          "Invalid status. Allowed: PENDING, PAYMENT_PENDING, PAID, PAYMENT_FAILED, EXPIRED, CANCELLED, COMPLETED",
          400,
        );
      }
      data.status = upper;
    }

    if (specialRequest !== undefined) {
      data.specialRequest = specialRequest;
    }
    if (guestName !== undefined) data.guestName = guestName;
    if (guestEmail !== undefined) data.guestEmail = guestEmail;
    if (guestPhone !== undefined) data.guestPhone = guestPhone;

    if (Object.keys(data).length === 0) {
      return jsonError("No updatable fields provided", 400);
    }

    const updated = await prisma.booking.update({
      where: { id },
      data,
      include: {
        room: true,
        roomType: true,
        user: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("PATCH /api/admin/bookings/[id] error:", error);

    if (error?.code === "P2025") {
      // Prisma "Record not found"
      return jsonError("Booking not found", 404);
    }

    return jsonError("Internal server error", 500);
  }
}

// DELETE /api/admin/bookings/:id
// 业务上做“软取消”：把状态改为 CANCELLED，而不是物理删除
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    const id = context.params.id;
    if (!id) {
      return jsonError("Missing booking id", 400);
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" as BookingStatus },
      include: {
        room: true,
        roomType: true,
        user: true,
      },
    });

    return NextResponse.json({
      data: updated,
      message: "Booking cancelled (soft delete).",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/bookings/[id] error:", error);

    if (error?.code === "P2025") {
      return jsonError("Booking not found", 404);
    }

    return jsonError("Internal server error", 500);
  }
}