// lib/booking.ts
import { prisma } from "./prisma";

export type RoomTypeForBooking = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  capacity: number;
  totalRooms: number;
};

// 列出所有房型 + 房间数量，供前端展示
export async function getRoomTypesForBooking(): Promise<RoomTypeForBooking[]> {
  const roomTypes = await prisma.roomType.findMany({
    include: {
      _count: {
        select: { rooms: true },
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

// 解析 YYYY-MM-DD（严格校验）
export function parseDateOnly(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;

  const trimmed = dateStr.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const d = new Date(year, month - 1, day);
  // 反向校验，防止 2025-13-40 之类被 JS 自动修正
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }

  return d;
}

// 计算晚数（checkOut 不住）
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
 * - 考虑已预订 Booking（PENDING / PAID）
 * - 考虑 RoomBlockDate（封锁日期）
 */
export async function findAvailableRoomForType(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<AvailableRoomResult> {
  // 所有此房型的房间
  const rooms = await prisma.room.findMany({
    where: { roomTypeId },
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

  // 房型是否在该时间段被整体封锁
  const block = await prisma.roomBlockDate.findFirst({
    where: {
      roomTypeId,
      startDate: { lt: checkOut },
      endDate: { gt: checkIn },
    },
  });

  if (block) {
    // 整个房型被封锁，视为全部不可用
    return {
      availableRoom: null,
      totalRooms: rooms.length,
      bookedCount: rooms.length,
    };
  }

  // 查找日期区间有冲突的预订
  const bookings = await prisma.booking.findMany({
    where: {
      room: {
        roomTypeId,
      },
      // 时间重叠条件：现有 checkIn < 新的 checkOut AND 现有 checkOut > 新的 checkIn
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
      status: {
        in: ["PENDING", "PAID"],
      },
    },
    select: {
      roomId: true,
    },
  });

  const bookedRoomIds = new Set(bookings.map((b) => b.roomId));
  const availableRoom = rooms.find((r) => !bookedRoomIds.has(r.id)) ?? null;

  return {
    availableRoom,
    totalRooms: rooms.length,
    bookedCount: bookedRoomIds.size,
  };
}
