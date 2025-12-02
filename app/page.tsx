<<<<<<< HEAD
// app/page.tsx
// Home page for the Walter Farm website. This page provides a hero section,
// a brief about section and quick links to the major sections of the site.
export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Walter Farm – Segamat, Johor
          </h1>
          <p className="text-sm md:text-base text-neutral-700">
            A family-friendly farm experience in Segamat. Reconnect with nature,
            enjoy outdoor activities, and spend quality time with your loved ones.
          </p>
          <div className="flex gap-3">
            <a
              href="/booking"
              className="inline-flex items-center justify-center rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
              Book Now
            </a>
            <a
              href="/accommodation"
              className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
            >
              View Accommodation
            </a>
          </div>
        </div>
        <div className="h-48 md:h-64 rounded-xl bg-neutral-200 flex items-center justify-center text-xs text-neutral-500">
          {/* TODO: replace with an actual Walter Farm photo in production */}
          Farm image placeholder
        </div>
      </section>

      {/* About Preview */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">About Walter Farm</h2>
        <p className="text-sm text-neutral-700 max-w-3xl">
          Walter Farm is a nature-based destination in Segamat, Johor, focusing on
          family-friendly outdoor and farm experiences.
        </p>
      </section>

      {/* Quick Links Grid */}
      <section className="grid md:grid-cols-3 gap-4 text-sm">
        <a
          href="/accommodation"
          className="rounded-lg border bg-white p-4 hover:border-green-600 hover:shadow-sm transition"
        >
          <h3 className="font-semibold mb-1">Accommodation</h3>
          <p className="text-neutral-700">
            Farm-style stays for families and groups. Details and availability managed
            from the booking system.
          </p>
        </a>
        <a
          href="/activities"
          className="rounded-lg border bg-white p-4 hover:border-green-600 hover:shadow-sm transition"
        >
          <h3 className="font-semibold mb-1">Activities</h3>
          <p className="text-neutral-700">
            Real farm activities such as animal interactions and outdoor
            experiences.
          </p>
        </a>
        <a
          href="/booking"
          className="rounded-lg border bg-white p-4 hover:border-green-600 hover:shadow-sm transition"
        >
          <h3 className="font-semibold mb-1">Booking</h3>
          <p className="text-neutral-700">
            Centralised booking flow for stays and experiences at Walter Farm.
          </p>
        </a>
      </section>
    </div>
  );
}
=======
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
>>>>>>> 2566318 (fix: add TypeScript types for Vercel build)
