// app/api/booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// GET /api/booking?id=xxx
// 用于前台“查看预订详情”（如确认页）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

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
  } catch (error) {
    console.error("GET /api/booking error:", error);
    return jsonError("Internal server error", 500);
  }
}

// POST /api/booking
// 创建预订 + 检查库存 + 分配具体房间
//
// Request body 示例：
// {
//   "roomTypeId": "xxx",
//   "checkIn": "2025-12-20",
//   "checkOut": "2025-12-22",
//   "guestName": "Demo Guest",
//   "guestEmail": "guest@example.com",
//   "guestPhone": "0123456789",
//   "specialRequest": "Late check-in"
// }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const {
      roomTypeId,
      checkIn,
      checkOut,
      guestName,
      guestEmail,
      guestPhone,
      specialRequest,
    } = body as {
      roomTypeId?: string;
      checkIn?: string;
      checkOut?: string;
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
      specialRequest?: string;
    };

    if (!roomTypeId || !checkIn || !checkOut || !guestName || !guestEmail) {
      return jsonError(
        "Missing required fields: roomTypeId, checkIn, checkOut, guestName, guestEmail",
        400,
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return jsonError("Invalid checkIn/checkOut date format", 400);
    }

    if (checkOutDate <= checkInDate) {
      return jsonError("checkOut must be after checkIn", 400);
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / msPerDay,
    );

    if (nights <= 0) {
      return jsonError("Stay length must be at least 1 night", 400);
    }

    // 事务：锁定房型 -> 找到可用房 -> 创建订单
    const booking = await prisma.$transaction(async (tx) => {
      const roomType = await tx.roomType.findUnique({
        where: { id: roomTypeId },
      });

      if (!roomType) {
        throw new Error("ROOM_TYPE_NOT_FOUND");
      }

      // 找一个可用房间：
      // 条件：该房间在给定日期区间内没有 PENDING / PAID / COMPLETED 订单
      const availableRoom = await tx.room.findFirst({
        where: {
          roomTypeId: roomType.id,
          isActive: true,
          bookings: {
            none: {
              status: {
                in: [
                  BookingStatus.PENDING,
                  BookingStatus.PAID,
                  BookingStatus.COMPLETED,
                ],
              },
              AND: [
                {
                  checkIn: {
                    lt: checkOutDate,
                  },
                },
                {
                  checkOut: {
                    gt: checkInDate,
                  },
                },
              ],
            },
          },
        },
        orderBy: {
          roomNumber: "asc",
        },
      });

      if (!availableRoom) {
        throw new Error("NO_AVAILABILITY");
      }

      const totalPrice = roomType.basePrice * nights;

      const created = await tx.booking.create({
        data: {
          roomTypeId: roomType.id,
          roomId: availableRoom.id,
          guestName,
          guestEmail,
          guestPhone: guestPhone ?? "",
          specialRequest: specialRequest ?? null,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          totalPrice,
          status: BookingStatus.PENDING, // 支付集成后再更新为 PAID
        },
        include: {
          room: true,
          roomType: true,
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        data: booking,
        message: "Booking created. Proceed to payment.",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("POST /api/booking error:", error);

    if (error instanceof Error) {
      if (error.message === "ROOM_TYPE_NOT_FOUND") {
        return jsonError("Room type not found", 404);
      }
      if (error.message === "NO_AVAILABILITY") {
        return jsonError("No available rooms for selected dates", 409);
      }
    }

    return jsonError("Internal server error", 500);
  }
}