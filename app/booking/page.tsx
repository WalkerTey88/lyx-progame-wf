// app/booking/page.tsx
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/BookingForm";

export default async function BookingPage() {
  const roomTypes = await prisma.roomType.findMany({
    orderBy: { basePrice: "asc" },
  });

  const mappedRoomTypes = roomTypes.map((rt) => ({
    id: rt.id,
    name: rt.name,
    description: rt.description ?? "",
    basePrice: rt.basePrice,
    capacity: rt.capacity,
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
        Book your stay at Walter Farm
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Select a room type, choose your dates and guest details. This form will
        call{" "}
        <code className="rounded bg-gray-100 px-1 text-xs">
          /api/booking
        </code>{" "}
        directly.
      </p>

      <BookingForm roomTypes={mappedRoomTypes} />
    </main>
  );
}