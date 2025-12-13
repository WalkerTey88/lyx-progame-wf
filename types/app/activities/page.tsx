// app/activities/page.tsx
import Image from "next/image";

export default function ActivitiesPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/walters-farm/mini-zoo-animals.jpg"
            alt="Kids visiting the mini zoo at Walters Farm Segamat"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-16 text-white md:py-22">
          <h1 className="text-3xl font-bold md:text-4xl">
            Activities &amp; Things to Do
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-gray-100">
            From mini zoo encounters to kids&apos; water park, ATV rides and
            outdoor play areas, Walters Farm Segamat is built around simple,
            family-friendly fun in the open air.
          </p>
        </div>
      </section>

      {/* Activity sections */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14 space-y-10">
        {/* Mini zoo */}
        <div className="grid gap-6 md:grid-cols-[3fr,2fr] items-center">
          <div>
            <h2 className="text-xl font-semibold">Mini Zoo &amp; Animal Feeding</h2>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              The mini zoo is the heart of Walters Farm Segamat. Families can
              meet chickens, swans, peacocks, goats, rabbits and more than 20
              animal species in clean, well-maintained enclosures.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-gray-800">
              <li>• Animal feeding sessions (kids&apos; favourite).</li>
              <li>• Gentle, approachable animals suitable for young children.</li>
              <li>• Simple educational exposure to farm and zoo animals.</li>
            </ul>
            <p className="mt-3 text-xs text-gray-600">
              Note: Children should always be accompanied by adults when feeding
              animals.
            </p>
          </div>
          <div className="relative h-52 rounded-xl overflow-hidden">
            <Image
              src="/images/walters-farm/mini-zoo-animals.jpg"
              alt="Mini zoo animals at Walters Farm"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Water park */}
        <div className="grid gap-6 md:grid-cols-[2fr,3fr] items-center">
          <div className="relative order-2 h-52 rounded-xl overflow-hidden md:order-1">
            <Image
              src="/images/walters-farm/water-park-main.jpg"
              alt="Kids water park with slides and splash areas"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-xl font-semibold">Kids Water Park</h2>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              The outdoor water play area is usually the busiest spot on hot
              weekends and school holidays. It is designed mainly for children,
              with shallow pools and slides.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-gray-800">
              <li>• Shallow pools and small slides for kids.</li>
              <li>• Parents can supervise from the side areas.</li>
              <li>• Best to bring extra clothes and towels.</li>
            </ul>
            <p className="mt-3 text-xs text-gray-600">
              Sun exposure can be strong at midday – sunscreen and hats are
              recommended.
            </p>
          </div>
        </div>

        {/* ATV & outdoor */}
        <div className="grid gap-6 md:grid-cols-[3fr,2fr] items-center">
          <div>
            <h2 className="text-xl font-semibold">ATV Rides &amp; Outdoor Play</h2>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              For slightly older kids and teenagers, ATV rides offer a bit more
              excitement, while younger children can enjoy the playground and
              open spaces.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-gray-800">
              <li>• ATV rides on designated tracks (extra fee applies).</li>
              <li>• Children&apos;s playground with slides and swings.</li>
              <li>• Open areas for casual family photos and walks.</li>
            </ul>
            <p className="mt-3 text-xs text-gray-600">
              Safety briefings and basic instructions are usually provided
              before ATV rides. Helmet usage is encouraged.
            </p>
          </div>
          <div className="relative h-52 rounded-xl overflow-hidden">
            <Image
              src="/images/walters-farm/activities-atv.jpg"
              alt="ATV riding at Walters Farm Segamat"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
