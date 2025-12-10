// types/walter.ts

// 统一跟 Prisma schema：BookingStatus = PENDING | PAID | CANCELLED | COMPLETED
export type BookingStatus = "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";

export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  isActive: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// 这里是给前台 / admin 用的 Booking 视图模型，跟 Prisma 字段对齐
export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  roomTypeId: string;

  guestName: string;
  guestEmail: string;
  guestPhone: string;

  checkIn: string;  // ISO date string
  checkOut: string; // ISO date string

  totalPrice: number;
  status: BookingStatus;

  createdAt: string;
  updatedAt: string;
}

// 通用 API 包装类型（可选用）
export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiItemResponse<T> {
  data: T;
}
