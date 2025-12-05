"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Walter Farm
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden block text-gray-700"
        >
          ☰
        </button>

        <div
          className={`md:flex gap-6 font-medium ${
            open ? "block" : "hidden"
          } md:block`}
        >
          <Link href="/accommodation">Accommodation</Link>
          <Link href="/activities">Activities</Link>
          <Link href="/facilities">Facilities</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/location">Location</Link>
          <Link href="/booking">Booking</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </nav>
  );
}
