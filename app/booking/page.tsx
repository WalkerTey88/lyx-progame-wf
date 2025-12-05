"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Room, Booking } from "@/types/walter";

export default function BookingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [guests, setGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Room[]>("/api/rooms")
      .then(setRooms)
      .catch(() => setMessage("Failed to load rooms."));
  }, []);

  useEffect(() => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (nights > 0) {
        setTotalPrice(room.price * nights);
      } else {
        setTotalPrice(null);
      }
    } else {
      setTotalPrice(null);
    }
  }, [roomId, startDate, endDate, rooms]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        roomId,
        startDate,
        endDate,
        numberOfGuests: guests,
        totalPrice: totalPrice ?? 0,
      };

      const res = await apiPost<Booking>("/api/booking", payload);
      setMessage(
        `Booking created successfully. Your booking ID is ${res.id}.`
      );
    } catch {
      setMessage("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Book Your Stay
          </h1>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Plan your stay at Walter Farm. Choose your room, select dates, and send us a booking request.
          </p>
        </div>

        <div className="bg-white/90 rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} — RM {room.price.toFixed(2)}/night
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of guests
              </label>
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {totalPrice != null && (
              <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  Estimated total
                </span>
                <span className="text-lg font-bold text-green-700">
                  RM {totalPrice.toFixed(2)}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-800 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit booking request"}
            </button>

            {message && (
              <p className="text-sm text-gray-700 mt-2 text-center">
                {message}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
