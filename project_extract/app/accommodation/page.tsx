// app/accommodation/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function AccommodationPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/walters-farm/accommodation-chalet-exterior.jpg"
            alt="Colourful farmstay chalets at Walters Farm Segamat"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-16 text-white md:py-24">
          <h1 className="text-3xl font-bold md:text-4xl">
            Farmstay Chalets &amp; Family Rooms
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-gray-100">
            Stay overnight at Walters Farm Segamat in colourful chalets and
            family rooms, all within walking distance of the mini zoo, kids
            water park, outdoor activities and food court.
          </p>
          <div>
            <Link
              href="/booking"
              className="inline-flex rounded-md bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Check availability &amp; book
            </Link>
          </div>
        </div>
      </section>

      {/* Intro + key facts */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-8 md:grid-cols-[2fr,3fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Simple, comfortable farmstay for families
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Walters Farm Segamat is designed as a full-day family escape.
              Many guests choose to stay overnight so the kids can spend more
              time at the mini zoo and water park, and parents can take a
              slower pace.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Rooms are basic but comfortable, with air-conditioning, private
              bathrooms and easy access to parking. The environment is calm at
              night, with views of the chalets and surrounding greenery.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-800">
              <li>Ideal for families with children (2–6 pax per unit).</li>
              <li>Short walk to mini zoo, water park and food court.</li>
              <li>Free on-site parking for overnight guests.</li>
              <li>Best to book in advance for weekends and school holidays.</li>
            </ul>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative h-48 rounded-xl overflow-hidden">
              <Image
                src="/images/walters-farm/accommodation-room-family.jpg"
                alt="Family room interior at Walters Farm"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-48 rounded-xl overflow-hidden">
              <Image
                src="/images/walters-farm/entrance-main.jpg"
                alt="Entrance and parking near the chalets"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Room types summary */}
      <section className="border-t bg-gray-50/60">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <h2 className="mb-6 text-xl font-semibold">Typical room options</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Standard Room */}
            <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="relative h-40">
                <Image
                  src="/images/walters-farm/accommodation-room-family.jpg"
                  alt="Standard room for small family"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-lg font-semibold">Standard Room</h3>
                <p className="mt-1 text-sm text-gray-700">
                  Ideal for a small family or couple that wants to stay close to
                  all the farm activities.
                </p>
                <ul className="mt-3 space-y-1 text-sm text-gray-800">
                  <li>• Sleeps 2–3 pax</li>
                  <li>• Air-conditioning, private bathroom</li>
                  <li>• Walking distance to mini zoo &amp; water park</li>
                </ul>
                <p className="mt-3 text-sm font-semibold text-emerald-700">
                  From around RM150–RM200 per night (indicative only).
                </p>
              </div>
            </article>

            {/* Family Chalet */}
            <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="relative h-40">
                <Image
                  src="/images/walters-farm/accommodation-chalet-exterior.jpg"
                  alt="Colourful family chalet exterior"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-lg font-semibold">Family Chalet</h3>
                <p className="mt-1 text-sm text-gray-700">
                  Colourful chalet-style units suitable for bigger families who
                  want more space and a private veranda.
                </p>
                <ul className="mt-3 space-y-1 text-sm text-gray-800">
                  <li>• Sleeps 4–6 pax</li>
                  <li>• Veranda / small porch in front of the unit</li>
                  <li>• Easy access to parking and main farm area</li>
                </ul>
                <p className="mt-3 text-sm font-semibold text-emerald-700">
                  From around RM250–RM350 per night (indicative only).
                </p>
              </div>
            </article>

            {/* Stay tips */}
            <article className="flex h-full flex-col justify-between rounded-xl border bg-white p-4 shadow-sm">
              <div>
                <h3 className="text-lg font-semibold">Practical tips</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-800">
                  <li>
                    • Peak periods: weekends, school holidays and public
                    holidays – book early via Facebook or phone.
                  </li>
                  <li>
                    • Bring extra clothes and towels for the water park and
                    outdoor play.
                  </li>
                  <li>
                    • Quiet hours at night – this is a family-focused, non-party
                    environment.
                  </li>
                  <li>
                    • Breakfast / meals can be taken at the on-site food court
                    and café.
                  </li>
                </ul>
              </div>
              <div className="mt-4">
                <Link
                  href="/booking"
                  className="inline-flex rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Go to booking form
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
