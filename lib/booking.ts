// lib/booking.ts
import { prisma } from "./prisma";

/**
 * 房型信息（含总房间数），供前端 booking 页面展示
 */
export type RoomTypeForBooking = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number; // 单位：分
  capacity: number;
  totalRooms: number;
};

/**
 * 列出所有房型 + 房间数量，供前端展示
 */
export async function getRoomTypesForBooking(): Promise<RoomTypeForBooking[]> {
  const roomTypes = await prisma.roomType.findMany({
    include: {
      _count: {
        select: {
          rooms: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return roomTypes.map((rt) => ({
    id: rt.id,
    name: rt.name,
    description: rt.description,
    basePrice: rt.basePrice,
    capacity: rt.capacity,
    totalRooms: rt._count.rooms,
  }));
}

/**
 * 解析 YYYY-MM-DD（严格校验，只接受这种格式）
 */
export function parseDateOnly(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;

  const trimmed = dateStr.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const d = new Date(year, month - 1, day);

  // 反向校验，防止 2025-13-40 被 JS 自动纠正
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }

  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 计算晚数（checkOut 不住）
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = checkOut.getTime() - checkIn.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / msPerDay);
}

export type AvailableRoomResult = {
  availableRoom: {
    id: string;
    roomNumber: string;
  } | null;
  totalRooms: number;
  bookedCount: number;
};

/**
 * 根据房型 + 日期区间 查找可用房间
 *
 * 目前只考虑 Booking 冲突（PENDING / PAID），不考虑封房表，
 * 目的是先保证 booking 流程和构建通过。
 */
export async function findAvailableRoomForType(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<AvailableRoomResult> {
  // 1. 所有此房型的房间
  const rooms = await prisma.room.findMany({
    where: { roomTypeId, isActive: true },
    select: {
      id: true,
      roomNumber: true,
    },
    orderBy: {
      roomNumber: "asc",
    },
  });

  if (rooms.length === 0) {
    return {
      availableRoom: null,
      totalRooms: 0,
      bookedCount: 0,
    };
  }

  // 2. 查找日期区间有冲突的预订
  // 时间重叠条件：现有 checkIn < 新的 checkOut AND 现有 checkOut > 新的 checkIn
  const bookings = await prisma.booking.findMany({
    where: {
      room: {
        roomTypeId,
      },
      checkIn: {
        lt: checkOut,
      },
      checkOut: {
        gt: checkIn,
      },
      status: {
        in: ["PENDING", "PAID"],
      },
    },
    select: {
      roomId: true,
    },
  });

  const bookedRoomIds = new Set(bookings.map((b) => b.roomId));

  // 3. 找出第一间未被占用的房间
  const availableRoom =
    rooms.find((r) => !bookedRoomIds.has(r.id)) ?? null;

  return {
    availableRoom,
    totalRooms: rooms.length,
    bookedCount: bookedRoomIds.size,
  };
}