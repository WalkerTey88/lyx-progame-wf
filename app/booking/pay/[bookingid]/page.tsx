// app/booking/pay/[bookingid]/page.tsx

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PayBookingPage({
  params,
}: {
  params: { bookingid: string };
}) {
  const bookingId = params.bookingid;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { roomType: true, room: true },
  });

  if (!booking) return notFound();

  const roomLabel =
    booking.roomType?.name ||
    (booking.room ? `Room ${booking.room.roomNumber}` : "Room");

  const currency = (process.env.BOOKING_CURRENCY || "MYR").toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Complete Payment</h1>

      <div className="mt-6 rounded-lg border p-4">
        <div className="text-sm text-gray-600">Booking ID</div>
        <div className="font-mono">{booking.id}</div>

        <div className="mt-4 text-sm text-gray-600">Room</div>
        <div>{roomLabel}</div>

        <div className="mt-4 text-sm text-gray-600">Amount</div>
        <div>
          {currency} {(Number(booking.totalPrice) / 100).toFixed(2)}
        </div>

        <form
          className="mt-6"
          action={async () => {
            "use server";
            // 这里仅提供页面展示；实际支付按钮一般在 client component 里调用 /api/payments/stripe/create
          }}
        >
          <p className="text-sm text-gray-600">
            Use the Pay button on the payment component to proceed.
          </p>
        </form>

        <div className="mt-6 flex gap-3">
          <Link
            className="rounded-md bg-black px-4 py-2 text-white"
            href={`/booking/pay?bookingId=${booking.id}`}
          >
            Proceed to Payment
          </Link>

          <Link className="rounded-md border px-4 py-2" href="/">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}