// types/walter.ts
export type BookingStatus = "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
export interface RoomType {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number;
  capacity: number;
  images?: string[] | null;
  createdAt: string;
  updatedAt: string;
}
export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Booking {
  id: string;
  userId?: string | null;
  roomId: string;
  roomTypeId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  specialRequest?: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface ApiListResponse<T> {
  data: T[];
}
export interface ApiItemResponse<T> {
  data: T;
}