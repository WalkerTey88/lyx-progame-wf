// app/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-10 md:flex-row md:py-16">
          {/* 左侧文案 */}
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Segamat · Johor · Malaysia
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Weekend escape to Walters Farm Segamat
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-gray-700 md:text-base">
              A 6-hectare recreational farm just 10 minutes from Segamat town,
              combining a mini zoo, kids water park, outdoor activities,
              food court &amp; café, and colourful farmstay chalets — perfect
              for young families looking to unwind close to nature.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/booking"
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700"
              >
                Check availability &amp; book
              </Link>
              <Link
                href="/accommodation"
                className="rounded-full border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                View farmstay rooms
              </Link>
            </div>

            <p className="mt-3 text-[11px] text-gray-500">
              Initial booking is handled online. Final confirmation and payment
              are completed directly with the farm team.
            </p>
          </div>

          {/* 右侧主图：入口 / 全景 */}
          <div className="flex-1">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-md md:h-80">
              <Image
                src="/images/walters-farm/entrance-main.jpg"
                alt="Entrance view of Walters Farm Segamat"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 480px, 100vw"
                priority
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              Reference visual: farm entrance / overview. You can replace this
              with any official hero image you prefer.
            </p>
          </div>
        </div>
      </section>

      {/* 四大核心区块 + 小配图 */}
      <section className="border-t bg-white py-10 md:py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
            Key experiences at Walters Farm
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Mini Zoo */}
            <div className="flex flex-col overflow-hidden rounded-xl border bg-gray-50">
              <div className="relative h-28 w-full">
                <Image
                  src="/images/walters-farm/mini-zoo-animals.jpg"
                  alt="Mini zoo animals at Walters Farm Segamat"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 240px, 50vw"
                />
              </div>
              <div className="flex-1 p-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Mini zoo
                </h3>
                <p className="mt-1 text-[11px] text-gray-600">
                  Friendly encounters with chickens, swans, peacocks, goats and
                  rabbits in a family-focused environment.
                </p>
              </div>
            </div>

            {/* Water park */}
            <div className="flex flex-col overflow-hidden rounded-xl border bg-gray-50">
              <div className="relative h-28 w-full">
                <Image
                  src="/images/walters-farm/water-park-main.jpg"
                  alt="Kids water play area at Walters Farm Segamat"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 240px, 50vw"
                />
              </div>
              <div className="flex-1 p-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Kids water play
                </h3>
                <p className="mt-1 text-[11px] text-gray-600">
                  Outdoor water play zone and slides designed primarily for
                  younger children.
                </p>
              </div>
            </div>

            {/* Outdoor activities */}
            <div className="flex flex-col overflow-hidden rounded-xl border bg-gray-50">
              <div className="relative h-28 w-full">
                <Image
                  src="/images/walters-farm/activities-atv.jpg"
                  alt="ATV and outdoor activities at Walters Farm Segamat"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 240px, 50vw"
                />
              </div>
              <div className="flex-1 p-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Outdoor activities
                </h3>
                <p className="mt-1 text-[11px] text-gray-600">
                  ATV rides, hanging bridge, playground and more, depending on
                  weather and operations.
                </p>
              </div>
            </div>

            {/* Farmstay */}
            <div className="flex flex-col overflow-hidden rounded-xl border bg-gray-50">
              <div className="relative h-28 w-full">
                <Image
                  src="/images/walters-farm/accommodation-chalet-exterior.jpg"
                  alt="Farmstay chalets at Walters Farm Segamat"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 240px, 50vw"
                />
              </div>
              <div className="flex-1 p-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Farmstay chalets
                </h3>
                <p className="mt-1 text-[11px] text-gray-600">
                  Simple, colourful chalets suitable for small to medium-sized
                  families who wish to stay overnight.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 简单 Booking CTA */}
      <section className="border-t bg-emerald-700 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div>
            <h2 className="text-xl font-semibold md:text-2xl">
              Ready to plan your family trip?
            </h2>
            <p className="mt-2 text-sm text-emerald-100">
              Check real-time room availability and send an initial booking
              request. The farm team will follow up via phone or WhatsApp.
            </p>
          </div>
          <Link
            href="/booking"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow-md hover:bg-emerald-50"
          >
            Go to booking form
          </Link>
        </div>
      </section>
    </main>
  );
}
