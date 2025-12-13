// app/booking/return/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type StatusResp = {
  data?: {
    bookingId: string;
    bookingStatus: string;
    payment: null | {
      id: string;
      status: string;
      providerPaymentRequestId: string;
      checkoutUrl?: string | null;
    };
  };
  error?: string;
};

export default function BookingReturnPage() {
  const sp = useSearchParams();
  const bookingId = useMemo(() => sp.get("bookingId") || "", [sp]);

  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function fetchStatus(refresh = false) {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/payments/hitpay/status?bookingId=${encodeURIComponent(
          bookingId
        )}&refresh=${refresh ? "true" : "false"}`
      );
      const json = (await res.json()) as StatusResp;
      if (!res.ok || json.error) {
        setError(json.error || "Failed to fetch status");
        setLoading(false);
        return;
      }
      setBookingStatus(json.data?.bookingStatus || "");
      setPaymentStatus(json.data?.payment?.status || "");
      setLoading(false);
    } catch (e: any) {
      setError(e?.message || "Network error");
      setLoading(false);
    }
  }

  async function payAgain() {
    setError(null);
    try {
      const res = await fetch("/api/payments/hitpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, idempotencyKey: `HP:RETRY:${bookingId}:${Date.now()}` }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.checkoutUrl) {
        setError(json?.error || "Failed to create payment");
        return;
      }
      window.location.href = String(json.data.checkoutUrl);
    } catch (e: any) {
      setError(e?.message || "Network error");
    }
  }

  useEffect(() => {
    fetchStatus(false);
    const timer = setInterval(() => fetchStatus(false), 2000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Payment Status</h1>

      {!bookingId ? (
        <p className="mt-4 text-sm text-red-600">Missing bookingId.</p>
      ) : (
        <>
          <div className="mt-6 rounded-lg border p-4">
            <div className="text-sm text-gray-600">Booking ID</div>
            <div className="mt-1 font-mono text-sm">{bookingId}</div>

            <div className="mt-4 text-sm text-gray-600">Booking Status</div>
            <div className="mt-1 font-semibold">{loading ? "Loading..." : bookingStatus}</div>

            <div className="mt-4 text-sm text-gray-600">Payment Status</div>
            <div className="mt-1 font-semibold">{loading ? "Loading..." : (paymentStatus || "N/A")}</div>

            {error ? (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            ) : null}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              onClick={() => fetchStatus(true)}
            >
              Refresh from HitPay
            </button>

            {(bookingStatus === "PAYMENT_FAILED" || bookingStatus === "EXPIRED") ? (
              <button
                type="button"
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                onClick={payAgain}
              >
                Pay again
              </button>
            ) : null}
          </div>

          {bookingStatus === "PAID" ? (
            <p className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
              Payment confirmed. Your booking is now PAID.
            </p>
          ) : null}
        </>
      )}
    </main>
  );
}
