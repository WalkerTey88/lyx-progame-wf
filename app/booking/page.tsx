"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { Booking } from "@/types/walter";

export default function BookingPage() {
  const [roomId, setRoomId] = useState("");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [guests, setGuests] = useState(1);

  async function handleSubmit(e: any) {
    e.preventDefault();

    const payload = {
      roomId,
      startDate,
      endDate,
      numberOfGuests: guests,
    };

    const res = await apiPost<Booking>("/api/booking", payload);
    alert("Booking created: " + res.id);
  }

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Booking</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input className="input" placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />

        <input className="input" type="date" value={startDate} onChange={e => setStart(e.target.value)} />

        <input className="input" type="date" value={endDate} onChange={e => setEnd(e.target.value)} />

        <input className="input" type="number" value={guests} onChange={e => setGuests(Number(e.target.value))} min={1} />

        <button className="bg-black text-white px-4 py-2 rounded" type="submit">
          Book Now
        </button>
      </form>
    </section>
  );
}
