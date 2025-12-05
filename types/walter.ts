export interface Room {
  id: string;
  name: string;
  slug: string;
  description?: string;
  capacity: number;
  price: number;
  gallery?: Gallery[];
  facilities?: RoomFacility[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  startDate: string;
  endDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface RoomFacility {
  id?: string;
  roomId?: string;
  facilityId?: string;
  facility?: Facility;
}

export interface Gallery {
  id: string;
  roomId?: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  price?: number;
  available: boolean;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}
