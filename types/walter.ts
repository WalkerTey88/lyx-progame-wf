// types/walter.ts

/**
 * 订单状态（与 Prisma / API 保持一致）
 */
export type BookingStatus = "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";

/**
 * 房型
 */
export interface RoomType {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number; // 单位：分（sen）
  capacity: number;
  images?: string[] | null;

  createdAt: string;
  updatedAt: string;
}

/**
 * 房间
 */
export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;

  isActive?: boolean;

  roomType?: RoomType;

  createdAt: string;
  updatedAt: string;
}

/**
 * 预订 / 订单
 */
export interface Booking {
  id: string;
  userId?: string | null;
  roomId: string;
  roomTypeId: string;

  guestName: string;
  guestEmail: string;
  guestPhone: string;

  checkIn: string;  // ISO string
  checkOut: string; // ISO string

  totalPrice: number;
  status: BookingStatus;

  /**
   * specialRequest 当前 API 层可以选择：
   * - 只在响应里返回（不一定入库），所以这里标记为可选
   */
  specialRequest?: string | null;

  createdAt: string;
  updatedAt: string;

  room?: Room;
  roomType?: RoomType;
}

/**
 * 通用 API 列表响应
 */
export interface ApiListResponse<T> {
  data: T[];
}

/**
 * 通用 API 单条响应
 */
export interface ApiItemResponse<T> {
  data: T;
}