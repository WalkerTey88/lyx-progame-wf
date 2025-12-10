// components/BookingForm.tsx
'use client';

import { useState } from 'react';

export type RoomTypeOption = {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number;
  capacity: number;
  totalRooms: number;
};

type BookingFormProps = {
  roomTypes: RoomTypeOption[];
};

type AvailabilityResult = {
  availableCount: number;
  totalRooms: number;
  isAvailable: boolean;
} | null;

type BookingResult = {
  bookingId: string;
  status: string;
  roomNumber: string;
  roomTypeName: string;
  totalPrice: number;
  nights: number;
} | null;

export default function BookingForm({ roomTypes }: BookingFormProps) {
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id ?? '');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [availabilityResult, setAvailabilityResult] =
    useState<AvailabilityResult>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult>(null);

  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckAvailability() {
    setError(null);
    setAvailabilityResult(null);
    setBookingResult(null);

    if (!roomTypeId || !checkIn || !checkOut) {
      setError('Please select a room type and both dates.');
      return;
    }

    try {
      setChecking(true);
      const res = await fetch('/api/booking/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomTypeId, checkIn, checkOut }),
      });

      let data: any = null;
      let text: string | null = null;
      try {
        data = await res.json();
      } catch {
        text = await res.text().catch(() => null);
      }

      if (!res.ok) {
        setError(
          (data && data.error) ||
            text ||
            `Failed to check availability (HTTP ${res.status}).`,
        );
        return;
      }

      setAvailabilityResult({
        availableCount: data.availableCount,
        totalRooms: data.totalRooms,
        isAvailable: data.isAvailable,
      });
    } catch (e) {
      console.error(e);
      setError('Unexpected error while checking availability (network).');
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmitBooking(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBookingResult(null);

    if (!roomTypeId || !checkIn || !checkOut || !name || !email) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomTypeId, checkIn, checkOut, name, email }),
      });

      let data: any = null;
      let text: string | null = null;
      try {
        data = await res.json();
      } catch {
        text = await res.text().catch(() => null);
      }

      if (!res.ok) {
        setError(
          (data && data.error) ||
            text ||
            `Failed to create booking (HTTP ${res.status}).`,
        );
        return;
      }

      setBookingResult({
        bookingId: data.bookingId,
        status: data.status,
        roomNumber: data.roomNumber,
        roomTypeName: data.roomTypeName,
        totalPrice: data.totalPrice,
        nights: data.nights,
      });
    } catch (e) {
      console.error(e);
      setError('Unexpected error while creating booking (network).');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedRoomType = roomTypes.find((rt) => rt.id === roomTypeId);

  return (
    <form onSubmit={handleSubmitBooking} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900">
          Room type
        </label>
        <select
          value={roomTypeId}
          onChange={(e) => setRoomTypeId(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        >
          {roomTypes.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.name} (from RM{rt.basePrice} / night)
            </option>
          ))}
        </select>
        {selectedRoomType?.description && (
          <p className="mt-1 text-xs text-gray-600">
            {selectedRoomType.description}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Check-in date
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Check-out date
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {availabilityResult && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            availabilityResult.isAvailable
              ? 'bg-green-50 text-green-800'
              : 'bg-amber-50 text-amber-800'
          }`}
        >
          {availabilityResult.isAvailable ? (
            <p>
              There are{' '}
              <span className="font-semibold">
                {availabilityResult.availableCount}
              </span>{' '}
              room(s) available for the selected dates.
            </p>
          ) : (
            <p>
              The selected room type appears to be fully booked for these
              dates.
            </p>
          )}
          <p className="mt-1 text-xs">
            Total rooms of this type: {availabilityResult.totalRooms}.
          </p>
        </div>
      )}

      {bookingResult && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          <p className="font-semibold">
            Booking created with ID: {bookingResult.bookingId}
          </p>
          <p className="mt-1">
            Room:{' '}
            <span className="font-medium">
              {bookingResult.roomTypeName} #{bookingResult.roomNumber}
            </span>
          </p>
          <p className="mt-1">
            Nights: {bookingResult.nights} · Total price: RM
            {bookingResult.totalPrice}
          </p>
          <p className="mt-1 text-xs">
            Status in system: {bookingResult.status}. Farm staff can now review
            and follow up with you.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCheckAvailability}
          disabled={checking}
          className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checking ? 'Checking...' : 'Check availability'}
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Create booking'}
        </button>
      </div>
    </form>
  );
}
