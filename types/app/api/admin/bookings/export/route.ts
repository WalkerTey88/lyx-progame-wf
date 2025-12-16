// app/api/admin/bookings/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/bookings/export
 * 导出所有订单为 CSV（仅 ADMIN / SUPERADMIN）
 * 注意：当前 Booking 模型没有 createdAt 字段，因此不导出“创建时间”这一列。
 */
export async function GET(_req: NextRequest) {
  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { checkIn: "desc" }, // 用 checkIn 排序
      include: {
        user: true,
        room: {
          include: {
            roomType: true,
          },
        },
      },
    });

    const header = [
      "BookingID",
      "Status",
      "CheckIn",
      "CheckOut",
      "Nights",
      "TotalPrice",
      "GuestName",
      "GuestEmail",
      "RoomNumber",
      "RoomType",
    ];

    const rows = bookings.map((b) => {
      const checkIn =
        b.checkIn instanceof Date ? b.checkIn : new Date(b.checkIn);
      const checkOut =
        b.checkOut instanceof Date ? b.checkOut : new Date(b.checkOut);

      const nights =
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);

      return [
        b.id,
        b.status,
        checkIn.toISOString().slice(0, 10),
        checkOut.toISOString().slice(0, 10),
        nights.toString(),
        b.totalPrice.toString(),
        b.user?.name ?? "",
        b.user?.email ?? "",
        b.room?.roomNumber ?? "",
        b.room?.roomType?.name ?? "",
      ];
    });

    const csvLines = [
      header.join(","),
      ...rows.map((r) =>
        r
          .map((value) => {
            const v = value ?? "";
            // 如果包含逗号/引号/换行，加双引号并转义内部引号
            if (/[",\n]/.test(v)) {
              return `"${v.replace(/"/g, '""')}"`;
            }
            return v;
          })
          .join(","),
      ),
    ];

    const csv = csvLines.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="walters-bookings-export.csv"',
      },
    });
  } catch (err) {
    console.error("[ADMIN_BOOKINGS_EXPORT_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to export bookings." },
      { status: 500 },
    );
  }
}