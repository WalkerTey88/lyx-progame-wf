"use client";

// app/booking/pay/PayClient.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type BookingData = {
  id: string;
  status: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn?: string;
  checkOut?: string;
  totalPrice?: number;
  roomType?: { name?: string };
  room?: { roomNumber?: string };
};

function formatMYRFromSen(sen?: number) {
  if (typeof sen !== "number") return "-";
  return `RM ${(sen / 100).toFixed(2)}`;
}

function ymd(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toISOString().slice(0, 10);
}

// Allow retry for PAYMENT_FAILED / EXPIRED
function canProceedToPayByStatus(status: string) {
  const s = String(status || "").toUpperCase();
  return !["CANCELLED", "COMPLETED", "PAID"].includes(s);
}

export default function PayClient({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(true);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const autoTimerRef = useRef<number | null>(null);
  const autoTriggeredRef = useRef(false);

  const canPay = useMemo(() => {
    return booking ? canProceedToPayByStatus(booking.status) : false;
  }, [booking]);

  async function fetchBooking(id: string) {
    const res = await fetch(`/api/booking?id=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Failed to load booking");
    return json?.data as BookingData;
  }

  async function createOrGetPayment(id: string) {
    const res = await fetch(`/api/payments/hitpay/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: id }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Failed to create payment");
    const url = json?.data?.checkoutUrl || json?.checkoutUrl || "";
    if (!url) throw new Error("Missing checkoutUrl from payment API");
    return String(url);
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!bookingId) {
        setError("Missing bookingId");
        setLoading(false);
        return;
      }

      try {
        setError("");
        setLoading(true);

        const b = await fetchBooking(bookingId);
        if (cancelled) return;

        setBooking(b);

        const status = String(b.status || "").toUpperCase();
        if (!canProceedToPayByStatus(status)) {
          setLoading(false);
          return;
        }

        setCreatingPayment(true);
        const url = await createOrGetPayment(bookingId);
        if (cancelled) return;

        setCheckoutUrl(url);

        // Auto redirect improves UX, but must NOT be the only path.
        if (!autoTriggeredRef.current) {
          autoTriggeredRef.current = true;
          autoTimerRef.current = window.setTimeout(() => {
            if (!cancelled) window.location.assign(url);
          }, 1200);
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Unknown error");
      } finally {
        if (cancelled) return;
        setCreatingPayment(false);
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
      if (autoTimerRef.current) {
        window.clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [bookingId]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Proceed to Payment</h1>

      {!bookingId ? <p style={{ marginTop: 12 }}>Missing bookingId.</p> : null}

      {error ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #f3c0c0" }}>
          <div style={{ fontWeight: 700 }}>Payment step failed</div>
          <div style={{ marginTop: 6 }}>{error}</div>
          <div style={{ marginTop: 10 }}>
            <Link href="/booking">Back to booking</Link>
          </div>
        </div>
      ) : null}

      {booking ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #e5e7eb" }}>
          <div style={{ fontWeight: 700 }}>Booking Summary</div>
          <div style={{ marginTop: 8, lineHeight: 1.7 }}>
            <div>Booking ID: {booking.id}</div>
            <div>Status: {String(booking.status)}</div>
            <div>Guest: {booking.guestName || "-"}</div>
            <div>Email: {booking.guestEmail || "-"}</div>
            <div>Room Type: {booking.roomType?.name || "-"}</div>
            <div>Room: {booking.room?.roomNumber || "-"}</div>
            <div>Check-in: {ymd(booking.checkIn)}</div>
            <div>Check-out: {ymd(booking.checkOut)}</div>
            <div>Total: {formatMYRFromSen(booking.totalPrice)}</div>
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 12, padding: 12, border: "1px dashed #e5e7eb" }}>
        {loading ? <div>Loading booking…</div> : null}
        {creatingPayment ? <div>Preparing payment…</div> : null}

        {!loading && !creatingPayment && booking && !canPay ? (
          <div>Payment not required for current status.</div>
        ) : null}

        {!loading && !creatingPayment && checkoutUrl && booking && canPay ? (
          <div>
            <div style={{ marginBottom: 10 }}>
              If you are not redirected automatically, click the button below.
            </div>

            <button
              type="button"
              onClick={() => window.location.assign(checkoutUrl)}
              style={{
                padding: "10px 14px",
                border: "1px solid #111827",
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              Continue to FPX Payment
            </button>

            <div style={{ marginTop: 10 }}>
              <a href={checkoutUrl}>Open payment link (fallback)</a>
            </div>
          </div>
        ) : null}

        {!loading && !creatingPayment && !checkoutUrl && !error && (!booking || canPay) ? (
          <div>Waiting…</div>
        ) : null}
      </div>

      <div style={{ marginTop: 12 }}>
        <Link href={`/booking/return?bookingId=${encodeURIComponent(bookingId)}`}>
          After paying, open the result page (if payment page doesn&apos;t return)
        </Link>
      </div>
    </div>
  );
}