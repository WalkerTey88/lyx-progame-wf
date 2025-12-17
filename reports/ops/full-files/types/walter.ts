// types/walter.ts

export type BookingStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAID"
  | "PAYMENT_FAILED"
  | "EXPIRED"
  | "CANCELLED"
  | "COMPLETED";