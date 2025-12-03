"use client";

import { useState } from 'react';

/**
 * 预订页面。
 * 提供一个简单的多字段表单用于收集预订信息。
 * 当前实现仅在前端处理并显示表单结果；后续可集成后端服务以完成真正的预订流程。
 */
export default function BookingPage() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [type, setType] = useState('cottage');
  const [submittedData, setSubmittedData] = useState<null | Record<string, unknown>>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedData({ checkIn, checkOut, guests, type });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-semibold">Booking</h1>
      <p className="text-sm md:text-base text-neutral-700 max-w-2xl">
        Use the form below to request a stay at Walter Farm. Select your check‑in and check‑out dates,
        choose the type of accommodation and specify the number of guests. This is a demonstration
        booking form; a real system would process your request on submission.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="flex flex-col">
          <label htmlFor="checkIn" className="text-sm font-medium mb-1">
            Check‑in Date
          </label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="checkOut" className="text-sm font-medium mb-1">
            Check‑out Date
          </label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="guests" className="text-sm font-medium mb-1">
            Number of Guests
          </label>
          <input
            id="guests"
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="type" className="text-sm font-medium mb-1">
            Accommodation Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="cottage">Farm Cottage</option>
            <option value="lodge">Lodge Suite</option>
            <option value="camping">Camping Pitch</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brandDark"
        >
          Submit Booking Request
        </button>
      </form>
      {submittedData && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md max-w-md">
          <h2 className="text-lg font-semibold mb-2 text-brandDark">Booking Summary</h2>
          <ul className="space-y-1 text-sm text-neutral-700">
            <li>
              <strong>Check‑in:</strong> {submittedData.checkIn as string}
            </li>
            <li>
              <strong>Check‑out:</strong> {submittedData.checkOut as string}
            </li>
            <li>
              <strong>Guests:</strong> {submittedData.guests as number}
            </li>
            <li>
              <strong>Accommodation:</strong>{' '}
              {submittedData.type === 'cottage'
                ? 'Farm Cottage'
                : submittedData.type === 'lodge'
                ? 'Lodge Suite'
                : 'Camping Pitch'}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}