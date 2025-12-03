'use client';
import { useState } from 'react';

export default function Booking() {
  const [name, setName] = useState('');
  const [nights, setNights] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Booking</h2>
      {!submitted ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1" htmlFor="name">Your Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 w-full"/>
          </div>
          <div>
            <label className="block mb-1" htmlFor="nights">Number of Nights</label>
            <input id="nights" type="number" min="1" value={nights} onChange={(e) => setNights(Number(e.target.value))} className="border p-2 w-full"/>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2">Submit Booking</button>
        </form>
      ) : (
        <div>
          <p className="mb-2">Thank you for your booking, {name}!</p>
          <p className="mb-2">Your stay is confirmed for {nights} night(s). We look forward to welcoming you at Walter Farm Segamat.</p>
        </div>
      )}
    </section>
  );
}