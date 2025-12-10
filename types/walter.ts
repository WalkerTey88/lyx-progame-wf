export interface Room {
  id: number;
  name: string;
  slug: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  bedType: string;
  imageUrl?: string | null;
  totalUnits: number;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Booking {
  id: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentProvider?: string | null;
  paymentReference?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiItemResponse<T> {
  data: T;
}
