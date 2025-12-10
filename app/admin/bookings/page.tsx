// app/admin/bookings/page.tsx
"use client";

import { useEffect, useState } from "react";

type BookingStatus = "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";

type AdminBooking = {
  id: string;
  status: BookingStatus;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  room: {
    id: string;
    roomNumber: string;
    roomType: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type FilterStatus = "ALL" | BookingStatus;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadBookings(status: FilterStatus = filterStatus) {
    setLoading(true);
    setError(null);

    try {
      const qs =
        status === "ALL" ? "" : `?status=${encodeURIComponent(status)}`;
      const res = await fetch(`/api/admin/bookings${qs}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load bookings.");
      }

      const data = (await res.json()) as { bookings: AdminBooking[] };
      setBookings(data.bookings ?? []);
    } catch (err: any) {
      setError(err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdatingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update booking.");
      }

      // 本地更新列表
      const data = (await res.json()) as { booking: AdminBooking };
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...data.booking } : b))
      );
    } catch (err: any) {
      setError(err.message || "Unexpected error.");
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString().slice(0, 10);
  }

  function calcNights(checkIn: string, checkOut: string) {
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "-";
    const diff = (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
    return diff.toString();
  }

  const filtered =
    filterStatus === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings (Admin)</h1>
          <p className="text-sm text-gray-600">
            Internal booking overview for Walters Farm Segamat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => {
              const next = e.target.value as FilterStatus;
              setFilterStatus(next);
              loadBookings(next);
            }}
            className="rounded border px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <a
            href="/api/admin/bookings/export"
            className="rounded bg-gray-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Export CSV
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-600">Loading bookings...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-600">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto rounded border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Guest</th>
                <th className="px-3 py-2">Room</th>
                <th className="px-3 py-2">Dates</th>
                <th className="px-3 py-2">Nights</th>
                <th className="px-3 py-2">Total (RM)</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-3 py-2 align-top text-xs text-gray-500">
                    {b.id}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium">
                      {b.user?.name || "(no name)"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {b.user?.email || "-"}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div>{b.room?.roomNumber || "-"}</div>
                    <div className="text-xs text-gray-500">
                      {b.room?.roomType?.name || ""}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top text-xs">
                    <div>In: {formatDate(b.checkIn)}</div>
                    <div>Out: {formatDate(b.checkOut)}</div>
                  </td>
                  <td className="px-3 py-2 align-top text-center text-xs">
                    {calcNights(b.checkIn, b.checkOut)}
                  </td>
                  <td className="px-3 py-2 align-top text-sm">
                    RM {b.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span
                      className={
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold " +
                        (b.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : b.status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : b.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800")
                      }
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex flex-wrap gap-1">
                      <button
                        className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={updatingId === b.id}
                        onClick={() => updateStatus(b.id, "PAID")}
                      >
                        Mark PAID
                      </button>
                      <button
                        className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={updatingId === b.id}
                        onClick={() => updateStatus(b.id, "COMPLETED")}
                      >
                        Complete
                      </button>
                      <button
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={updatingId === b.id}
                        onClick={() => updateStatus(b.id, "CANCELLED")}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
