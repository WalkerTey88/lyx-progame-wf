// app/accommodation/page.tsx
import { Room } from "@/types/walter";

async function fetchRooms(): Promise<Room[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/rooms`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch rooms");
  }

  return res.json();
}

export default async function AccommodationPage() {
  const rooms = await fetchRooms();

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Accommodation</h1>
      <p className="text-gray-600 mb-8">
        Explore our rooms at Walter Farm and choose the perfect stay for your visit.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="border rounded-xl overflow-hidden shadow-sm bg-white flex flex-col"
          >
            {room.gallery?.[0]?.imageUrl && (
              <div className="h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={room.gallery[0].imageUrl}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4 flex-1 flex flex-col">
              <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
              <p className="text-gray-600 text-sm mb-3">
                {room.description ?? "Comfortable and cozy stay at Walter Farm."}
              </p>

              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-medium">
                  Capacity: {room.capacity} guest{room.capacity > 1 ? "s" : ""}
                </span>
                <span className="font-bold text-green-700">
                  RM {room.price.toFixed(2)} / night
                </span>
              </div>

              {room.facilities?.length > 0 && (
                <div className="text-xs text-gray-500 mb-3">
                  <span className="font-semibold mr-1">Facilities:</span>
                  {room.facilities
                    .map((rf) => rf.facility?.name)
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              )}

              <a
                href={`/booking?roomId=${room.id}`}
                className="mt-auto inline-flex items-center justify-center rounded-lg border border-green-700 text-green-700 px-3 py-2 text-sm font-medium hover:bg-green-50"
              >
                Book this room
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
