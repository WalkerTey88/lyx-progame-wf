// components/BookingForm.tsx
"use client";

import { useState } from "react";

type RoomTypeOption = {
  id: string;
  name: string;
  description: string;
  basePrice: number; // 分 / sen
  capacity: number;
};

type Props = {
  roomTypes: RoomTypeOption[];
};

// 统一响应类型：成功 / 失败都走这个结构
type BookingResponse = {
  data?: {
    id: string;
    roomId: string;
    roomTypeId: string;
    status: string;
    totalPrice: number;
  } | null;
  message?: string;
  error?: string;
};

export function BookingForm({ roomTypes }: Props) {
  const [roomTypeId, setRoomTypeId] = useState(
    roomTypes[0]?.id ?? "",
  );
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const selectedRoomType =
    roomTypes.find((rt) => rt.id === roomTypeId) ?? null;

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = outDate.getTime() - inDate.getTime();
    if (Number.isNaN(diff) || diff <= 0) return 0;
    return Math.round(diff / (1000 * 60 * 60 * 24));
  })();

  const estimatedTotal =
    selectedRoomType && nights > 0
      ? (selectedRoomType.basePrice * nights) / 100
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreatedId(null);

    if (!roomTypeId) {
      setError("Please select a room type.");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates.");
      return;
    }

    if (!guestName || !guestEmail) {
      setError("Guest name and email are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomTypeId,
          checkIn,
          checkOut,
          guestName,
          guestEmail,
          guestPhone,
          specialRequest,
        }),
      });

      const data = (await res.json()) as BookingResponse;

      // 失败分支：HTTP 非 2xx 或 data.data 为空
      if (!res.ok || !data.data) {
        const msg =
          data.error ||
          data.message ||
          "Failed to create booking.";
        setError(msg);
        return;
      }

      // 成功分支
      setSuccess(
        data.message ??
          "Booking created successfully. Proceed to payment or confirmation.",
      );
      setCreatedId(data.data.id);
    } catch (err) {
      console.error("BookingForm submit error:", err);
      setError("Unexpected error while creating booking.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
    >
      {/* Room type */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Room type
        </label>
        <select
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={roomTypeId}
          onChange={(e) => setRoomTypeId(e.target.value)}
        >
          {roomTypes.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.name} · up to {rt.capacity} pax
            </option>
          ))}
        </select>
        {selectedRoomType && (
          <p className="text-xs text-gray-500">
            {selectedRoomType.description} · From{" "}
            <span className="font-semibold">
              RM {(selectedRoomType.basePrice / 100).toFixed(2)}
            </span>{" "}
            per night
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Check-in
          </label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Check-out
          </label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
      </div>

      {/* Guest info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Guest name
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Guest email
          </label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Guest phone (optional)
        </label>
        <input
          type="tel"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          placeholder="+60..."
        />
      </div>

      {/* Special request */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Special request (optional)
        </label>
        <textarea
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          rows={3}
          value={specialRequest}
          onChange={(e) => setSpecialRequest(e.target.value)}
          placeholder="E.g. late check-in, baby cot, etc."
        />
      </div>

      {/* Summary */}
      <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-700">
        <p>
          Nights:{" "}
          <span className="font-semibold">
            {nights > 0 ? nights : "-"}
          </span>
        </p>
        <p>
          Estimated total:{" "}
          <span className="font-semibold">
            {estimatedTotal !== null
              ? `RM ${estimatedTotal.toFixed(2)}`
              : "-"}
          </span>
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <p>{success}</p>
          {createdId && (
            <p className="mt-1">
              Booking ID:{" "}
              <span className="font-mono text-[11px]">
                {createdId}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating booking..." : "Create booking"}
        </button>
        <p className="text-[11px] text-gray-500">
          This is a demo form for testing the booking engine.
        </p>
      </div>
    </form>
  );
}