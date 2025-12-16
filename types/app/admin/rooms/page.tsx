// app/admin/rooms/page.tsx
'use client';

import { useEffect, useState } from 'react';

type AdminRoomTypeOption = {
  id: string;
  name: string;
};

type AdminRoom = {
  id: string;
  roomNumber: string;
  isActive: boolean;
  roomType: {
    id: string;
    name: string;
  };
};

export default function AdminRoomsPage() {
  const [roomTypes, setRoomTypes] = useState<AdminRoomTypeOption[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roomTypeId, setRoomTypeId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [isActive, setIsActive] = useState(true);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [rtRes, roomsRes] = await Promise.all([
        fetch('/api/admin/room-types'),
        fetch('/api/admin/rooms'),
      ]);

      const rtData = await rtRes.json();
      const roomsData = await roomsRes.json();

      if (!rtRes.ok) {
        setError(rtData.error ?? 'Failed to load room types.');
        return;
      }
      if (!roomsRes.ok) {
        setError(roomsData.error ?? 'Failed to load rooms.');
        return;
      }

      const rtOptions: AdminRoomTypeOption[] = (rtData.roomTypes ?? []).map(
        (rt: any) => ({
          id: rt.id,
          name: rt.name,
        }),
      );

      setRoomTypes(rtOptions);
      setRooms(roomsData.rooms ?? []);

      if (!roomTypeId && rtOptions.length > 0) {
        setRoomTypeId(rtOptions[0].id);
      }
    } catch (e) {
      console.error(e);
      setError('Unexpected error while loading rooms/room types.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!roomTypeId || !roomNumber) {
      setError('Room type and room number are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomTypeId, roomNumber, isActive }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to create room.');
        return;
      }

      setRoomNumber('');
      setIsActive(true);
      await loadData();
    } catch (e) {
      console.error(e);
      setError('Unexpected error while creating room.');
    }
  }

  async function toggleActive(room: AdminRoom) {
    setError(null);

    try {
      const res = await fetch(`/api/admin/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !room.isActive }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to update room.');
        return;
      }

      setRooms((prev) =>
        prev.map((r) =>
          r.id === room.id ? { ...r, isActive: !room.isActive } : r,
        ),
      );
    } catch (e) {
      console.error(e);
      setError('Unexpected error while updating room.');
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Rooms
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Maintain physical room inventory mapped to room types.
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">Add new room</h2>
        <form
          onSubmit={createRoom}
          className="mt-3 grid gap-3 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700">
              Room type
            </label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
            >
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Room number
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="101"
            />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Active
            </label>
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Create room
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-900">
          Existing rooms
        </h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">
                  Room
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">
                  Type
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">
                  Active
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-gray-500"
                  >
                    No rooms yet.
                  </td>
                </tr>
              )}
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-3 py-2 font-medium text-gray-900">
                    #{room.roomNumber}
                  </td>
                  <td className="px-3 py-2 text-gray-900">
                    {room.roomType.name}
                  </td>
                  <td className="px-3 py-2 text-gray-900">
                    {room.isActive ? 'Yes' : 'No'}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(room)}
                      className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800"
                    >
                      {room.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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
