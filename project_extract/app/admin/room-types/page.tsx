// app/admin/room-types/page.tsx
'use client';

import { useEffect, useState } from 'react';

type AdminRoomType = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  capacity: number;
  totalRooms: number;
};

export default function AdminRoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<AdminRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [capacity, setCapacity] = useState('');

  async function loadRoomTypes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/room-types');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load room types.');
        return;
      }
      setRoomTypes(data.roomTypes ?? []);
    } catch (e) {
      console.error(e);
      setError('Unexpected error while loading room types.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoomTypes();
  }, []);

  async function createRoomType(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !basePrice || !capacity) {
      setError('Name, base price and capacity are required.');
      return;
    }

    const basePriceNum = Number(basePrice);
    const capacityNum = Number(capacity);

    if (Number.isNaN(basePriceNum) || Number.isNaN(capacityNum)) {
      setError('Base price and capacity must be numbers.');
      return;
    }

    try {
      const res = await fetch('/api/admin/room-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          basePrice: basePriceNum,
          capacity: capacityNum,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create room type.');
        return;
      }

      setName('');
      setDescription('');
      setBasePrice('');
      setCapacity('');
      await loadRoomTypes();
    } catch (e) {
      console.error(e);
      setError('Unexpected error while creating room type.');
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Room types
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Maintain the master list of room types used by the booking engine.
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Add new room type
        </h2>
        <form
          onSubmit={createRoomType}
          className="mt-3 grid gap-3 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700">
              Name
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Standard Room"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Base price (RM/night)
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              inputMode="numeric"
              placeholder="150"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Capacity (pax)
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              inputMode="numeric"
              placeholder="2"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for internal use."
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Create room type
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-900">
          Existing room types
        </h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">
                  Name
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">
                  Base price
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">
                  Capacity
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">
                  Rooms
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roomTypes.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-gray-500"
                  >
                    No room types yet.
                  </td>
                </tr>
              )}
              {roomTypes.map((rt) => (
                <tr key={rt.id}>
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {rt.name}
                  </td>
                  <td className="px-3 py-2 text-gray-900">
                    RM{rt.basePrice}
                  </td>
                  <td className="px-3 py-2 text-gray-900">{rt.capacity}</td>
                  <td className="px-3 py-2 text-gray-900">
                    {rt.totalRooms} room(s)
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {rt.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
