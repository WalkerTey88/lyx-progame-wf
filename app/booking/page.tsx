// app/booking/page.tsx
"use client";

import { FormEvent, useState } from "react";

type RoomType = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  capacity: number;
  totalRooms?: number;
  images?: string[] | null;
};

type StatusType = "idle" | "success" | "error" | "info";

export default function BookingPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomTypesLoaded, setRoomTypesLoaded] = useState(false);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);

  const [guestName, setGuestName] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");
  const [specialRequest, setSpecialRequest] = useState<string>("");

  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);

  const [statusType, setStatusType] = useState<StatusType>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [availableRoomsCount, setAvailableRoomsCount] = useState<number | null>(
    null,
  );

  const selectedRoomType =
    roomTypes.find((rt) => rt.id === selectedRoomTypeId) ?? null;

  function resetStatus() {
    setStatusType("idle");
    setStatusMessage("");
    setAvailableRoomsCount(null);
  }

  async function loadRoomTypes() {
    resetStatus();
    setLoadingRoomTypes(true);
    try {
      const res = await fetch("/api/room-types", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`Failed to load room types (${res.status})`);
      }

      const data = (await res.json()) as RoomType[];
      setRoomTypes(data ?? []);
      setRoomTypesLoaded(true);

      if (!selectedRoomTypeId && data && data.length > 0) {
        setSelectedRoomTypeId(data[0].id);
      }

      setStatusType("success");
      setStatusMessage("Room types loaded.");
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatusMessage("Failed to load room types. Please try again.");
    } finally {
      setLoadingRoomTypes(false);
    }
  }

  function validateBasic(): string | null {
    if (!roomTypesLoaded || roomTypes.length === 0) {
      return "Please load room types first.";
    }
    if (!selectedRoomTypeId) {
      return "Please select a room type.";
    }
    if (!checkIn || !checkOut) {
      return "Please select check-in and check-out dates.";
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      return "Check-out must be after check-in.";
    }
    if (guests <= 0) {
      return "Guests must be at least 1.";
    }
    return null;
  }

  async function handleCheckAvailability() {
    resetStatus();

    const error = validateBasic();
    if (error) {
      setStatusType("error");
      setStatusMessage(error);
      return;
    }

    setChecking(true);
    try {
      const res = await fetch("/api/booking/check-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomTypeId: selectedRoomTypeId,
          checkIn,
          checkOut,
          guests,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to check availability.";
        try {
          const data = await res.json();
          if (data && typeof data.message === "string") {
            msg = data.message;
          }
        } catch {
          // ignore
        }
        setStatusType("error");
        setStatusMessage(msg);
        return;
      }

      const data = await res.json().catch(() => ({} as any));
      const count =
        typeof data.availableRooms === "number" ? data.availableRooms : null;

      setAvailableRoomsCount(count);

      if (count !== null && count > 0) {
        setStatusType("success");
        setStatusMessage(
          `Good news, there are ${count} room(s) available for the selected dates.`,
        );
      } else {
        setStatusType("info");
        setStatusMessage(
          "Unfortunately, no rooms are available for the selected dates.",
        );
      }
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatusMessage("Failed to check availability. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetStatus();

    const basicError = validateBasic();
    if (basicError) {
      setStatusType("error");
      setStatusMessage(basicError);
      return;
    }

    if (!guestName || !guestEmail || !guestPhone) {
      setStatusType("error");
      setStatusMessage("Please fill in your name, email and phone.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomTypeId: selectedRoomTypeId,
          checkIn,
          checkOut,
          guests,
          guestName,
          guestEmail,
          guestPhone,
          specialRequest,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to create booking.";
        try {
          const data = await res.json();
          if (data && typeof data.message === "string") {
            msg = data.message;
          }
        } catch {
          // ignore
        }
        setStatusType("error");
        setStatusMessage(msg);
        return;
      }

      const data = await res.json().catch(() => ({} as any));

      setStatusType("success");
      setStatusMessage(
        data && data.reference
          ? `Booking created successfully. Reference: ${data.reference}`
          : "Booking created successfully. We will contact you shortly.",
      );

      // 可选：重置表单（保留日期和房型，方便用户继续订）
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setSpecialRequest("");
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatusMessage("Failed to create booking. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="bg-gradient-to-b from-emerald-50/40 to-white">
      <section className="border-b border-emerald-100 bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Walters Farm Segamat · Johor · Malaysia
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Online Booking Request
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-700 md:text-base">
              Submit your preferred dates and room type. Our team will confirm
              availability and send you WhatsApp / email with payment details.
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-900 shadow-sm md:text-sm">
            <p className="font-semibold">Operation Hours</p>
            <p>Farm &amp; check-in: 9:00am – 6:00pm</p>
            <p>Booking support: 10:00am – 9:00pm</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr),minmax(0,1.2fr)]">
          {/* 左侧：表单 */}
          <div className="space-y-6 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100 md:p-6">
            {/* Step 1: 房型 */}
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Step 1 · Room type
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={loadRoomTypes}
                    disabled={loadingRoomTypes}
                    className="inline-flex items-center rounded-md border border-emerald-600 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {roomTypesLoaded ? "Refresh room types" : "Load room types"}
                  </button>
                </div>
              </div>

              {roomTypesLoaded && roomTypes.length === 0 && (
                <p className="text-xs text-amber-700">
                  No room types configured yet. Please contact Walters Farm
                  directly for booking.
                </p>
              )}

              {roomTypesLoaded && roomTypes.length > 0 && (
                <div className="space-y-3">
                  {roomTypes.map((rt) => {
                    const selected = rt.id === selectedRoomTypeId;
                    return (
                      <button
                        key={rt.id}
                        type="button"
                        onClick={() => setSelectedRoomTypeId(rt.id)}
                        className={[
                          "w-full rounded-xl border px-3 py-3 text-left text-sm transition",
                          selected
                            ? "border-emerald-600 bg-emerald-50/70 shadow-sm"
                            : "border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {rt.name}
                            </p>
                            {rt.description && (
                              <p className="mt-1 text-xs text-gray-600">
                                {rt.description}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                              Up to {rt.capacity} guests ·{" "}
                              {typeof rt.totalRooms === "number"
                                ? `${rt.totalRooms} room(s) total`
                                : "Multiple rooms available"}
                            </p>
                          </div>
                          <div className="text-right text-xs text-gray-700">
                            <p className="font-semibold text-emerald-700">
                              From RM {(rt.basePrice / 100).toFixed(2)} / night
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: 日期 + 人数 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Step 2 · Dates &amp; guests
                </h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Check-in date
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Check-out date
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Guests
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={selectedRoomType?.capacity ?? 10}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value) || 1)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={checking || creating}
                  className="inline-flex items-center rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checking ? "Checking availability..." : "Check availability"}
                </button>

                <button
                  type="submit"
                  disabled={creating || checking}
                  className="inline-flex items-center rounded-md border border-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Submitting booking..." : "Submit booking request"}
                </button>

                {availableRoomsCount !== null && (
                  <span className="text-xs text-gray-700">
                    Available rooms for selected dates:{" "}
                    <span className="font-semibold">
                      {availableRoomsCount}
                    </span>
                  </span>
                )}
              </div>

              {/* Step 3: 联系方式 */}
              <div className="border-t border-dashed border-emerald-100 pt-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Step 3 · Your contact details
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      placeholder="e.g. Chan Mei Ling"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      placeholder="e.g. meiling@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      WhatsApp / phone
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      placeholder="+60 ..."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Special request (optional)
                    </label>
                    <textarea
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
                      rows={3}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      placeholder="E.g. late check-in, connecting rooms, baby cot..."
                    />
                  </div>
                </div>
              </div>

              {/* 状态提示 */}
              {statusType !== "idle" && statusMessage && (
                <div
                  className={[
                    "rounded-md border px-3 py-2 text-xs",
                    statusType === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : statusType === "error"
                      ? "border-red-200 bg-red-50 text-red-900"
                      : "border-amber-200 bg-amber-50 text-amber-900",
                  ].join(" ")}
                >
                  {statusMessage}
                </div>
              )}
            </form>
          </div>

          {/* 右侧：说明 / 联系方式 */}
          <aside className="space-y-4 rounded-2xl bg-emerald-900 px-4 py-5 text-xs text-emerald-50 shadow-sm md:px-5 md:py-6 md:text-sm">
            <div>
              <h2 className="text-sm font-semibold text-white">
                How our booking works
              </h2>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>Select your room type and dates.</li>
                <li>Submit your booking request form.</li>
                <li>
                  Our team will confirm availability and total price via
                  WhatsApp / email.
                </li>
                <li>
                  Once you make payment, we will send you a confirmed booking
                  slip.
                </li>
              </ol>
            </div>

            <div className="border-t border-emerald-700 pt-3">
              <h3 className="text-sm font-semibold text-white">
                Important notes
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>
                  Check-in time: <span className="font-semibold">3:00pm</span>
                  ; check-out time:{" "}
                  <span className="font-semibold">12:00pm</span>.
                </li>
                <li>
                  Peak season / school holidays rates may differ from normal
                  days.
                </li>
                <li>
                  For urgent same-day booking, please call or WhatsApp us
                  directly.
                </li>
              </ul>
            </div>

            <div className="border-t border-emerald-700 pt-3">
              <h3 className="text-sm font-semibold text-white">Contact us</h3>
              <p className="mt-2">
                Phone / WhatsApp:{" "}
                <span className="font-semibold text-emerald-100">
                  +60 16-613 6281
                </span>
                <br />
                Facebook:{" "}
                <span className="font-semibold text-emerald-100">
                  @waltersfarmsegamat
                </span>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
