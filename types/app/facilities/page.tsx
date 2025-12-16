// app/facilities/page.tsx
import Image from "next/image";

export default function FacilitiesPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/walters-farm/food-court-overview.jpg"
            alt="Food court at Walters Farm Segamat"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-16 text-white md:py-22">
          <h1 className="text-3xl font-bold md:text-4xl">
            Facilities &amp; On-site Services
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-gray-100">
            Walters Farm Segamat offers basic but practical facilities to make a
            family day trip or overnight stay comfortable – including food
            court, café, parking and play areas.
          </p>
        </div>
      </section>

      {/* Facilities grid */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Food court */}
          <article className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="relative h-44">
              <Image
                src="/images/walters-farm/food-court-overview.jpg"
                alt="Food court and café at Walters Farm"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-lg font-semibold">
                Food Court &amp; Café Area
              </h2>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                The food court and café area serves simple, family-friendly
                meals such as local rice and noodle dishes, snacks and drinks.
                It is the main place to rest between activities.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-800">
                <li>• Local favourites, snacks and drinks.</li>
                <li>• Covered seating area with fans.</li>
                <li>• Convenient for quick breaks between activities.</li>
              </ul>
            </div>
          </article>

          {/* Playground */}
          <article className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="relative h-44">
              <Image
                src="/images/walters-farm/facilities-playground.jpg"
                alt="Playground and outdoor space for kids"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-lg font-semibold">Playground &amp; Open Space</h2>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                In addition to the water park, there are dry play areas and open
                spaces where younger children can run around and use up energy.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-800">
                <li>• Slides, swings and basic playground structures.</li>
                <li>• Open lawn areas for informal games and photos.</li>
                <li>• Close to main activity zones for convenience.</li>
              </ul>
            </div>
          </article>

          {/* Parking */}
          <article className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="relative h-44">
              <Image
                src="/images/walters-farm/facilities-parking.jpg"
                alt="Parking area near entrance of Walters Farm"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-lg font-semibold">Parking &amp; Access</h2>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                Walters Farm Segamat is primarily a drive-in destination. The
                entrance area includes open-air parking lots for day visitors
                and overnight guests.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-800">
                <li>• On-site open-air parking (subject to availability).</li>
                <li>
                  • Short walking distance from parking to ticketing and main
                  entrance.
                </li>
                <li>
                  • Located about 10 minutes&apos; drive from Segamat town
                  centre.
                </li>
              </ul>
            </div>
          </article>

          {/* Map / Location */}
          <article className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="relative h-44">
              <Image
                src="/images/walters-farm/location-map-static.jpg"
                alt="Approximate location of Walters Farm Segamat on the map"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-lg font-semibold">Location Overview</h2>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                Walters Farm Segamat is located near Batu 3, along Jalan
                Segamat–Jementah, roughly a 10-minute drive from Segamat town.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-800">
                <li>
                  • Nearby landmark: Petronas petrol station at Batu 3, Jalan
                  Muar–Jementah.
                </li>
                <li>
                  • Easy to reach by car or taxi / e-hailing from Segamat
                  town.
                </li>
                <li>
                  • For navigation, search for &quot;Walters Farm Segamat&quot;
                  in common map apps.
                </li>
              </ul>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
