// lib/booking.ts
import { prisma } from './prisma';

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
      basePrice: 'asc',
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

// 解析 YYYY-MM-DD
export function parseDateOnly(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-').map((p) => Number(p));
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  if (!year || !month || !day) return null;
  // 本地时区的 00:00
  return new Date(year, month - 1, day);
}

// 计算晚数
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.round(diff / msPerDay);
}

// 查找指定房型的可用房间
export async function findAvailableRoomForType(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
) {
  // 有效房间
  const rooms = await prisma.room.findMany({
    where: {
      roomTypeId,
      isActive: true,
    },
    orderBy: {
      roomNumber: 'asc',
    },
  });

  if (rooms.length === 0) {
    return {
      availableRoom: null as null,
      totalRooms: 0,
      bookedCount: 0,
    };
  }

  // 找该房型在日期范围内的所有占用记录
  const bookings = await prisma.booking.findMany({
    where: {
      room: {
        roomTypeId,
      },
      // overlap: existing.checkIn < checkOut AND existing.checkOut > checkIn
      AND: [
        {
          checkIn: {
            lt: checkOut,
          },
        },
        {
          checkOut: {
            gt: checkIn,
          },
        },
      ],
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
