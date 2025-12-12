// app/admin/bookings/page.tsx
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// 本地定义 BookingStatus，而不是从 @prisma/client 引入
const BOOKING_STATUS_VALUES = [
  "PENDING",
  "PAID",
  "CANCELLED",
  "COMPLETED",
] as const;

type BookingStatus = (typeof BOOKING_STATUS_VALUES)[number];

// Server Action: 更新状态
async function updateBookingStatus(formData: FormData) {
  "use server";

  const id = formData.get("id") as string | null;
  const status = formData.get("status") as string | null;

  if (!id || !status) return;

  const upper = status.toUpperCase() as BookingStatus;

  if (!BOOKING_STATUS_VALUES.includes(upper)) {
    // 非法状态，直接忽略
    return;
  }

  await prisma.booking.update({
    where: { id },
    data: { status: upper },
  });

  revalidatePath("/admin/bookings");
}

// Server Action: 软取消（改成 CANCELLED）
async function cancelBooking(formData: FormData) {
  "use server";

  const id = formData.get("id") as string | null;
  if (!id) return;

  await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" as BookingStatus },
  });

  revalidatePath("/admin/bookings");
}

export default async function AdminBookingsPage() {
  // 直接查数据库
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      room: true,
      roomType: true,
      user: true,
    },
  });

  const statusOptions: BookingStatus[] = [...BOOKING_STATUS_VALUES];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Admin · Bookings</h1>
      <p className="text-sm text-gray-600 mb-4">
        This page reads bookings directly from the database using Prisma and
        uses server actions to update or cancel bookings.
      </p>

      <p className="text-sm font-medium mb-6">
        Total bookings: <span className="font-bold">{bookings.length}</span>
      </p>

      {bookings.length === 0 ? (
        <p className="text-sm text-gray-500">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id} className="align-top">
                  {/* Guest */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {b.guestName}
                    </div>
                    <div className="text-xs text-gray-600">
                      {b.guestEmail}
                    </div>
                    {b.guestPhone && (
                      <div className="text-xs text-gray-600">
                        {b.guestPhone}
                      </div>
                    )}
                    {b.specialRequest && (
                      <div className="mt-1 text-xs text-amber-700">
                        Req: {b.specialRequest}
                      </div>
                    )}
                  </td>

                  {/* Room */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {b.roomType?.name ?? "-"}
                    </div>
                    <div className="text-xs text-gray-600">
                      Room {b.room?.roomNumber ?? "-"}
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(b.checkIn).toLocaleDateString()} →{" "}
                    {new Date(b.checkOut).toLocaleDateString()}
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3 text-sm text-gray-900">
                    RM {(b.totalPrice / 100).toFixed(2)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-xs font-semibold">
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1">
                      {b.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 space-y-2">
                    {/* 更新状态 */}
                    <form action={updateBookingStatus} className="flex gap-2">
                      <input type="hidden" name="id" value={b.id} />
                      <select
                        name="status"
                        defaultValue={b.status}
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        Update
                      </button>
                    </form>

                    {/* 软取消 */}
                    <form action={cancelBooking}>
                      <input type="hidden" name="id" value={b.id} />
                      <button
                        type="submit"
                        className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    </form>
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