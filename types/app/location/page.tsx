// app/location/page.tsx
import { walterConfig } from "@/walter-config";

export const metadata = {
  title: "Location | Walters Farm Segamat",
  description:
    "How to get to Walters Farm Segamat – address, driving directions and nearby landmarks.",
};

export default function LocationPage() {
  const { location } = walterConfig;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Location</h1>
      <p className="mb-6 text-gray-700">
        {walterConfig.name} is located just outside Segamat town, making it
        convenient for local families and visitors from Johor, Melaka and
        beyond.
      </p>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Address</h2>
        <p className="text-gray-700">
          {location.addressLine1}
          <br />
          {location.addressLine2}
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Driving Directions</h2>
        <p className="mb-2 text-gray-700">{location.drivingNotes}</p>
        <ul className="list-disc space-y-2 pl-6 text-gray-700">
          <li>
            From <strong>Segamat town</strong>: approximately 10 minutes drive.
          </li>
          <li>
            From <strong>Johor Bahru</strong>: around 2–3 hours drive depending
            on traffic.
          </li>
          <li>
            Nearby landmarks: Petronas Batu 3 (Jalan Muar-Jementah), Segamat
            iron bridge and Kebunhaus glamping area.
          </li>
        </ul>
      </section>
    </main>
  );
}
