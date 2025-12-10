// app/booking/page.tsx
"use client";

import { useState } from "react";

type RoomType = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  capacity: number;
  images: string[] | null;
  _count_rooms?: number;
  availableRooms?: number;
};

export default function BookingPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomTypesLoaded, setRoomTypesLoaded] = useState(false);

  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(
    null,
  );
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"info" | "success" | "error">(
    "info",
  );
  const [availableInfo, setAvailableInfo] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  async function ensureRoomTypesLoaded() {
    if (roomTypesLoaded) return;
    try {
      const res = await fetch("/api/room-types", { method: "GET" });
      if (!res.ok) {
        throw new Error("Failed to load room types");
      }
      const data = await res.json();
      const list: RoomType[] = data?.roomTypes ?? data ?? [];
      setRoomTypes(list);
      if (list.length > 0 && !selectedRoomTypeId) {
        setSelectedRoomTypeId(list[0].id);
      }
      setRoomTypesLoaded(true);
    } catch {
      setStatusType("error");
      setStatusMessage("Unable to load room types. Please try again later.");
    }
  }

  function validateBasic() {
    if (!checkIn || !checkOut) {
      setStatusType("error");
      setStatusMessage("Please select check-in and check-out dates.");
      return false;
    }
    if (!selectedRoomTypeId) {
      setStatusType("error");
      setStatusMessage("Please select a room type.");
      return false;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      setStatusType("error");
      setStatusMessage("Check-out date must be after check-in date.");
      return false;
    }
    return true;
  }

  async function handleCheckAvailability() {
    setStatusMessage(null);
    setAvailableInfo(null);
    setBookingId(null);

    if (!validateBasic()) return;

    setChecking(true);
    try {
      await ensureRoomTypesLoaded();

      const res = await fetch("/api/bookings/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomTypeId: selectedRoomTypeId,
          checkIn,
          checkOut,
        }),
      });

      if (!res.ok) {
        let msg = "Selected dates are not available.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore
        }
        setStatusType("error");
        setStatusMessage(msg);
        return;
      }

      const data = await res.json().catch(() => ({}));
      const count =
        typeof data.availableRooms === "number"
          ? data.availableRooms
          : undefined;

      setStatusType("success");
      setStatusMessage("Dates are available for this room type.");
      setAvailableInfo(
        typeof count === "number"
          ? `Remaining rooms for this period: ${count}`
          : null,
      );
    } catch {
      setStatusType("error");
      setStatusMessage(
        "Unable to check availability. Please try again in a moment.",
      );
    } finally {
      setChecking(false);
    }
  }

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);
    setAvailableInfo(null);
    setBookingId(null);

    if (!validateBasic()) return;
    if (!guestName || !guestEmail || !guestPhone) {
      setStatusType("error");
      setStatusMessage("Please fill in guest name, email and phone.");
      return;
    }

    setCreating(true);
    try {
      await ensureRoomTypesLoaded();

      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomTypeId: selectedRoomTypeId,
          checkIn,
          checkOut,
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          notes,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to create booking.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore
        }
        setStatusType("error");
        setStatusMessage(msg);
        return;
      }

      const data = await res.json().catch(() => ({}));
      const id = data?.id ?? data?.bookingId ?? null;

      setStatusType("success");
      setStatusMessage("Booking request submitted successfully.");
      if (id) {
        setBookingId(id);
      }
    } catch {
      setStatusType("error");
      setStatusMessage(
        "Network error while creating booking. Please try again.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="bg-white">
      <section className="border-b bg-emerald-50/70">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Booking &amp; Availability
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-700 md:text-base">
            Check real-time room availability and submit an initial booking
            request for Walters Farm Segamat. Our team will confirm your stay
            and payment details via WhatsApp or phone.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-4 grid gap-8 lg:grid-cols-[3fr,2fr]">
          {/* 左侧：表单流程 */}
          <div>
            {/* Step 1: 日期选择 */}
            <div className="rounded-xl border bg-gray-50 p-5 mb-5">
              <h2 className="text-sm font-semibold text-gray-900">
                Step 1 · Select your dates
              </h2>
              <p className="mt-1 text-xs text-gray-600">
                Walters Farm typically operates from 10:00 AM to 6:00 PM.
                Farmstay guests can check in and stay overnight depending on
                the room type.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Check-in date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Check-out date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: 房型选择 */}
            <div className="rounded-xl border bg-gray-50 p-5 mb-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-900">
                  Step 2 · Choose a farmstay room type
                </h2>
                <button
                  type="button"
                  onClick={ensureRoomTypesLoaded}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
                >
                  {roomTypesLoaded ? "Refresh room types" : "Load room types"}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Room types and prices may vary by season. The options below are
                based on current configuration.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {roomTypes.length === 0 && (
                  <p className="text-xs text-gray-500">
                    Room types will appear here after loading. Click &quot;Load
                    room types&quot; if this is empty.
                  </p>
                )}

                {roomTypes.map((rt) => {
                  const active = selectedRoomTypeId === rt.id;
                  const available =
                    typeof rt.availableRooms === "number"
                      ? rt.availableRooms
                      : rt._count_rooms;

                  return (
                    <button
                      key={rt.id}
                      type="button"
                      onClick={() => setSelectedRoomTypeId(rt.id)}
                      className={[
                        "flex flex-col rounded-lg border p-3 text-left text-xs transition-shadow",
                        active
                          ? "border-emerald-600 bg-white shadow-sm"
                          : "border-gray-200 bg-white hover:border-emerald-400",
                      ].join(" ")}
                    >
                      <span className="text-sm font-semibold text-gray-900">
                        {rt.name}
                      </span>
                      {rt.description && (
                        <span className="mt-1 text-[11px] text-gray-600">
                          {rt.description}
                        </span>
                      )}
                      <span className="mt-2 text-[11px] text-gray-700">
                        From{" "}
                        <span className="font-semibold">
                          RM {rt.basePrice.toFixed(0)}
                        </span>{" "}
                        · Up to {rt.capacity} guests
                      </span>
                      {typeof available === "number" && (
                        <span className="mt-1 text-[11px] text-emerald-700">
                          Configured rooms: {available}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Guest 信息 + 提交 */}
            <form
              onSubmit={handleCreateBooking}
              className="rounded-xl border bg-gray-50 p-5"
            >
              <h2 className="text-sm font-semibold text-gray-900">
                Step 3 · Guest details &amp; submit request
              </h2>
              <p className="mt-1 text-xs text-gray-600">
                Please provide the main guest&apos;s contact details. The
                Walters Farm team will use this information to confirm your
                stay and follow up with payment arrangements.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Full name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Mobile / WhatsApp
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Special requests (optional)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. baby cot, connecting rooms, birthday surprise..."
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={checking || creating}
                  className="rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checking ? "Checking..." : "Check availability only"}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Submitting booking..." : "Submit booking request"}
                </button>
              </div>

              <p className="mt-3 text-[11px] text-gray-500">
                This form submits an initial booking request. Final confirmation
                and payment are handled directly by Walters Farm Segamat.
              </p>

              {statusMessage && (
                <div
                  className={[
                    "mt-4 rounded-md border px-3 py-2 text-xs",
                    statusType === "success"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : statusType === "error"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 bg-white text-gray-700",
                  ].join(" ")}
                >
                  {statusMessage}
                  {availableInfo && (
                    <div className="mt-1 text-[11px] text-emerald-700">
                      {availableInfo}
                    </div>
                  )}
                  {bookingId && (
                    <div className="mt-1 text-[11px] text-gray-700">
                      Booking reference:{" "}
                      <span className="font-mono">{bookingId}</span>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* 右侧：信息侧栏 */}
          <aside className="space-y-5">
            <div className="rounded-xl border bg-white p-4 text-xs text-gray-700">
              <h3 className="text-sm font-semibold text-gray-900">
                Walters Farm booking notes
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Farmstay availability depends on room type and season.</li>
                <li>
                  Peak periods (school holidays / public holidays) may be
                  limited.
                </li>
                <li>
                  For large groups or events, please contact the team directly
                  via phone or Facebook Messenger.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border bg-white p-4 text-xs text-gray-700">
              <h3 className="text-sm font-semibold text-gray-900">
                Contact &amp; location
              </h3>
              <p className="mt-2">
                Lot 463 &amp; 464, Batu 3, Jalan Segamat–Jementah,
                <br />
                Mukim Gemereh, 85000 Segamat, Johor, Malaysia.
              </p>
              <p className="mt-2">
                Phone:{" "}
                <span className="font-semibold text-gray-900">
                  +60 16-613 6281
                </span>
                <br />
                Enquiries via Facebook Messenger (@waltersfarmsegamat).
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
