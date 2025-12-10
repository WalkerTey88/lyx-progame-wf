// app/admin/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard | Walters Farm Segamat',
};

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        Admin Dashboard
      </h1>
      <p className="mt-3 text-gray-700">
        Internal tools for managing bookings, room types and rooms.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/bookings"
          className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-green-600"
        >
          <h2 className="text-lg font-semibold text-gray-900">Bookings</h2>
          <p className="mt-1 text-sm text-gray-600">
            View and update booking status.
          </p>
        </Link>

        <Link
          href="/admin/room-types"
          className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-green-600"
        >
          <h2 className="text-lg font-semibold text-gray-900">Room types</h2>
          <p className="mt-1 text-sm text-gray-600">
            Maintain farmstay room categories.
          </p>
        </Link>

        <Link
          href="/admin/rooms"
          className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-green-600"
        >
          <h2 className="text-lg font-semibold text-gray-900">Rooms</h2>
          <p className="mt-1 text-sm text-gray-600">
            Maintain physical room numbers and active status.
          </p>
        </Link>
      </div>
    </main>
  );
}
