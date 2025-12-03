import Image from 'next/image';
import Link from 'next/link';

/**
 * 网站首页。
 * 提供农场概览以及快速导航到住宿、活动和预订等页面。
 */
export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* 头部横幅 */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brandDark">
            Welcome to Walter Farm
          </h1>
          <p className="text-neutral-700 text-base leading-relaxed max-w-md">
            Located in the lush countryside of Segamat, Johor, Walter Farm offers families
            and visitors a chance to disconnect from the city and reconnect with nature.
            Enjoy farm-style stays, interactive animal experiences, and fresh local cuisine.
          </p>
          <div className="flex gap-3">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brandDark"
            >
              Plan Your Visit
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
            >
              Learn More
            </Link>
          </div>
        </div>
        <div className="h-56 md:h-64 relative rounded-xl overflow-hidden">
          {/* TODO: 替换为农场真实图片。将图片放置于 public/images 文件夹中并更新路径 */}
          <Image
            src="/images/farm.jpg"
            alt="Walter Farm Overview"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* 优势介绍 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Why Visit Walter Farm?</h2>
        <ul className="list-disc list-inside space-y-1 text-neutral-700 max-w-3xl">
          <li>Authentic farm stay experiences in comfortable cottages and lodges.</li>
          <li>Fun and educational activities for all ages, from animal feeding to nature walks.</li>
          <li>Fresh farm‑to‑table meals featuring seasonal produce.</li>
        </ul>
      </section>

      {/* 快速链接卡片 */}
      <section className="grid md:grid-cols-3 gap-4 text-sm">
        <Link
          href="/accommodation"
          className="rounded-lg border bg-white p-4 hover:border-brand hover:shadow-sm transition"
        >
          <h3 className="font-semibold mb-1">Accommodation</h3>
          <p className="text-neutral-700">
            Choose from a range of farm‑style stays including cozy cottages, spacious lodges, and
            camping pitches.
          </p>
        </Link>
        <Link
          href="/activities"
          className="rounded-lg border bg-white p-4 hover:border-brand hover:shadow-sm transition"
        >
          <h3 className="font-semibold mb-1">Activities</h3>
          <p className="text-neutral-700">
            Participate in hands‑on experiences such as feeding animals, guided garden tours and
            fishing on our private pond.
          </p>
        </Link>
        <Link
          href="/booking"
          className="rounded-lg border bg-white p-4 hover:border-brand hover:shadow-sm transition"
        >
          <h3 className="font-semibold mb-1">Booking</h3>
          <p className="text-neutral-700">
            Start your booking for stays and experiences at Walter Farm. Choose dates, select your
            preferred accommodation, and customize your itinerary.
          </p>
        </Link>
      </section>
    </div>
  );
}