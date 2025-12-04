// app/facilities/page.tsx
import { Facility } from "@/types/walter";

type FacilityWithRooms = Facility & {
  rooms: { roomId: string }[];
};

async function fetchFacilities(): Promise<FacilityWithRooms[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/facilities`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch facilities");
  }

  return res.json();
}

export default async function FacilitiesPage() {
  const facilities = await fetchFacilities();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Facilities</h1>
      <p className="text-gray-600 mb-8">
        Facilities available across our rooms and around Walter Farm.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {facilities.map((facility) => (
          <div
            key={facility.id}
            className="border rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-center mb-2">
              {facility.icon && (
                <span className="mr-2 text-xl" aria-hidden="true">
                  {facility.icon}
                </span>
              )}
              <h2 className="text-lg font-semibold">{facility.name}</h2>
            </div>
            {facility.description && (
              <p className="text-sm text-gray-600 mb-2">{facility.description}</p>
            )}
            <p className="text-xs text-gray-500">
              Used in {facility.rooms.length} room(s)
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
