import { apiGet } from "@/lib/api";
import { Room } from "@/types/walter";

export default async function RoomsPage() {
  const rooms = await apiGet<Room[]>("/api/rooms");

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Rooms at Walter Farm
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Cozy farmstay rooms surrounded by nature. Choose the perfect stay for your trip to Segamat.
          </p>
        </div>

        {rooms.length === 0 ? (
          <p className="text-center text-gray-500">
            No rooms have been set up yet. Please add rooms in the admin panel.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <article
                key={room.id}
                className="flex flex-col bg-white/80 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="h-40 w-full rounded-t-2xl overflow-hidden bg-gradient-to-r from-green-200 to-amber-100 flex items-center justify-center">
                  <span className="text-3xl">🏡</span>
                </div>

                <div className="flex-1 flex flex-col p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {room.name}
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 text-xs font-medium px-2 py-1">
                      Max {room.capacity} guest{room.capacity > 1 ? "s" : ""}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3">
                    {room.description ||
                      "A simple and comfortable room at Walter Farm, ideal for a relaxing countryside stay."}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        From
                      </p>
                      <p className="text-xl font-bold text-green-700">
                        RM {room.price.toFixed(2)}
                        <span className="text-xs text-gray-500 ml-1">/ night</span>
                      </p>
                    </div>
                    <a
                      href={`/booking?roomId=${room.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-green-700 text-white text-xs font-semibold px-4 py-2 hover:bg-green-800 transition-colors"
                    >
                      Book now
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
