import { apiGet } from "@/lib/api";
import { Room } from "@/types/walter";

export default async function RoomsPage() {
  const rooms = await apiGet<Room[]>("/api/rooms");

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Rooms</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{room.name}</h2>
            <p className="text-gray-700">{room.description}</p>
            <p className="mt-2 font-bold">RM {room.price}</p>
            <p className="text-sm text-gray-500">Capacity: {room.capacity}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
