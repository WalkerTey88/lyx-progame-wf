// components/BookingForm.tsx
"use client";

import { useMemo, useState } from "react";

type RoomTypeOption = {
  id: string;
  name: string;
  description: string;
  basePrice: number; // sen
  capacity: number;
};

type Props = {
  roomTypes: RoomTypeOption[];
};

type BookingResponse = {
  data?: {
    id: string;
    roomId: string;
    roomTypeId: string;
    status: string;
    totalPrice: number;
  } | null;
  payment?: { checkoutUrl?: string | null } | null;
  checkoutUrl?: string | null;
  message?: string;
  error?: string;
};

export function BookingForm({ roomTypes }: Props) {
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id ?? "");
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
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const selectedRoomType = useMemo(
    () => roomTypes.find((rt) => rt.id === roomTypeId) ?? null,
    [roomTypeId, roomTypes],
  );

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const inDate = new Date(`${checkIn}T00:00:00`);
    const outDate = new Date(`${checkOut}T00:00:00`);
    const diff = outDate.getTime() - inDate.getTime();
    if (Number.isNaN(diff) || diff <= 0) return 0;
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

  const estimatedTotal =
    selectedRoomType && nights > 0 ? (selectedRoomType.basePrice * nights) / 100 : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 关键：防双提交（消灭双 POST / 跳转被打断）
    if (isSubmitting) return;

    setError(null);
    setSuccess(null);
    setCreatedId(null);
    setCheckoutUrl(null);

    if (!roomTypeId) return setError("Please select a room type.");
    if (!checkIn || !checkOut) return setError("Please select check-in and check-out dates.");
    if (!guestName || !guestEmail) return setError("Guest name and email are required.");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const data = (await res.json().catch(() => null)) as BookingResponse | null;

      if (!res.ok || !data?.data?.id) {
        const msg = (data && (data.error || data.message)) || "Failed to create booking.";
        setError(msg);
        return;
      }

      const bookingId = String(data.data.id);

      setSuccess(data.message ?? "Booking created successfully.");
      setCreatedId(bookingId);

      const url = data.checkoutUrl || data.payment?.checkoutUrl || null;
      setCheckoutUrl(url);

      if (url) {
        window.location.assign(url);
        return;
      }

      // 关键：fallback 不再跳 /booking/pay?id=...，统一跳 return（稳定闭环）
      window.location.assign(`/booking/return?bookingId=${encodeURIComponent(bookingId)}`);
      return;
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
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Room type</label>
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
            <span className="font-semibold">RM {(selectedRoomType.basePrice / 100).toFixed(2)}</span>{" "}
            per night
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Check-in</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Check-out</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Guest name</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Guest email</label>
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
        <label className="block text-sm font-medium text-gray-700">Guest phone (optional)</label>
        <input
          type="tel"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          placeholder="+60..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Special request (optional)</label>
        <textarea
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          rows={3}
          value={specialRequest}
          onChange={(e) => setSpecialRequest(e.target.value)}
          placeholder="E.g. late check-in, baby cot, etc."
        />
      </div>

      <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-700">
        <p>
          Nights: <span className="font-semibold">{nights > 0 ? nights : "-"}</span>
        </p>
        <p>
          Estimated total:{" "}
          <span className="font-semibold">
            {estimatedTotal !== null ? `RM ${estimatedTotal.toFixed(2)}` : "-"}
          </span>
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <p>{success}</p>

          {createdId && (
            <>
              <p className="mt-1">
                Booking ID: <span className="font-mono text-[11px]">{createdId}</span>
              </p>
              <p className="mt-1">
                Continue:{" "}
                <a
                  className="underline"
                  href={`/booking/return?bookingId=${encodeURIComponent(createdId)}`}
                >
                  Open booking status
                </a>
              </p>
            </>
          )}

          {checkoutUrl && (
            <p className="mt-1 break-all">
              Checkout URL: <span className="font-mono text-[11px]">{checkoutUrl}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating booking..." : "Create booking"}
        </button>
        <p className="text-[11px] text-gray-500">This is a demo form for testing the booking engine.</p>
      </div>
    </form>
  );
}