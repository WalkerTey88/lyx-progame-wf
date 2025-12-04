// types/walter.ts

export type Facility = {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
};

export type RoomFacility = {
  roomId: string;
  facilityId: string;
  facility: Facility;
};

export type GalleryItem = {
  id: string;
  roomId?: string | null;
  imageUrl: string;
  description?: string | null;
  createdAt: string;
};

export type Room = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  capacity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  facilities: RoomFacility[];
  gallery: GalleryItem[];
};

export type Activity = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  available: boolean;
  startTime?: string | null;
  endTime?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  createdAt: string;
};

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type Booking = {
  id: string;
  roomId: string;
  room: Room;
  startDate: string;
  endDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};
