// app/admin/bookings/page.tsx
import { BookingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// Server Action: 更新状态
export async function updateBookingStatus(formData: FormData) {
  "use server";

  const id = formData.get("id") as string | null;
  const status = formData.get("status") as string | null;

  if (!id || !status) {
    return;
  }

  // 简单校验一下 status
  const upper = status.toUpperCase() as BookingStatus;
  const allowed: BookingStatus[] = [
    BookingStatus.PENDING,
    BookingStatus.PAID,
    BookingStatus.CANCELLED,
    BookingStatus.COMPLETED,
  ];

  if (!allowed.includes(upper)) {
    return;
  }

  await prisma.booking.update({
    where: { id },
    data: { status: upper },
  });

  revalidatePath("/admin/bookings");
}

// Server Action: 软取消（改成 CANCELLED）
export async function cancelBooking(formData: FormData) {
  "use server";

  const id = formData.get("id") as string | null;
  if (!id) return;

  await prisma.booking.update({
    where: { id },
    data: { status: BookingStatus.CANCELLED },
  });

  revalidatePath("/admin/bookings");
}

export default async function AdminBookingsPage() {
  // 直接查数据库，不再通过 /api
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      room: true,
      roomType: true,
      user: true,
    },
  });

  const statusOptions: BookingStatus[] = [
    BookingStatus.PENDING,
    BookingStatus.PAID,
    BookingStatus.CANCELLED,
    BookingStatus.COMPLETED,
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
        Admin · Bookings
      </h1>
      <p className="mb-4 text-sm text-gray-600">
        This page reads bookings directly from the database using Prisma and
        uses server actions to update or cancel bookings.
      </p>

      <div className="mb-4 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">
        <p>
          Total bookings:{" "}
          <span className="font-semibold">{bookings.length}</span>
        </p>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-gray-500">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Guest
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Room
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Dates
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {bookings.map((b) => (
                <tr key={b.id} className="align-top">
                  <td className="px-3 py-3">
                    <div className="text-xs font-medium text-gray-900">
                      {b.guestName}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {b.guestEmail}
                    </div>
                    {b.guestPhone && (
                      <div className="text-[11px] text-gray-500">
                        {b.guestPhone}
                      </div>
                    )}
                    {b.specialRequest && (
                      <div className="mt-1 text-[11px] text-gray-500">
                        Req: {b.specialRequest}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-900">
                      {b.roomType?.name ?? "-"}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Room {b.room?.roomNumber ?? "-"}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700">
                    <div>
                      {new Date(b.checkIn).toLocaleDateString()} →{" "}
                      {new Date(b.checkOut).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700">
                    RM {(b.totalPrice / 100).toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700">
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-700">
                      {b.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700">
                    <div className="flex flex-col gap-2">
                      {/* 更新状态 */}
                      <form action={updateBookingStatus} className="flex gap-1">
                        <input type="hidden" name="id" value={b.id} />
                        <select
                          name="status"
                          defaultValue={b.status}
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
                        >
                          Update
                        </button>
                      </form>

                      {/* 软取消 */}
                      <form action={cancelBooking}>
                        <input type="hidden" name="id" value={b.id} />
                        <button
                          type="submit"
                          className="rounded-md bg-red-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      </form>
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