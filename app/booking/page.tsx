// app/booking/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Room } from "@/types/walter";

async function fetchRooms(): Promise<Room[]> {
  const res = await fetch("/api/rooms", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch rooms");
  return res.json();
}

export default function BookingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms()
      .then(setRooms)
      .catch(() => setMessage("Failed to load rooms."));
  }, []);

  useEffect(() => {
    const selectedRoom = rooms.find((r) => r.id === roomId);
    if (selectedRoom && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (nights > 0) {
        setTotalPrice(selectedRoom.price * nights);
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
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          startDate,
          endDate,
          numberOfGuests: guests,
          totalPrice: totalPrice ?? 0,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      setMessage("Booking created successfully. We will contact you soon.");
    } catch {
      setMessage("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Booking</h1>
      <p className="text-gray-600 mb-8">
        Fill in the details below to request a booking at Walter Farm.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Room</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          >
            <option value="">Select a room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} (RM {room.price.toFixed(2)} / night)
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Check-in</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Check-out</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Guests</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>

        {totalPrice != null && (
          <div className="text-sm font-semibold text-green-700">
            Estimated total: RM {totalPrice.toFixed(2)}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-green-700 text-white py-2 text-sm font-medium hover:bg-green-800 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Booking"}
        </button>

        {message && (
          <p className="text-sm mt-2 text-gray-700">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
