import '@prisma/client';

declare module '@prisma/client' {
  interface Booking {
    currency?: string;
  }
}
