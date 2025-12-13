"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";

export default function ReturnClient() {
  const sp = useSearchParams();

  const params = useMemo(() => {
    const obj: Record<string, string> = {};
    sp.forEach((v, k) => (obj[k] = v));
    return obj;
  }, [sp]);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Payment Return</h1>
      <p className="mt-2 text-sm opacity-80">
        This page reads query parameters from the redirect URL. If you do not see expected values,
        verify your payment provider redirect/return URL configuration.
      </p>

      <div className="mt-6 rounded-lg border p-4">
        <h2 className="text-lg font-medium">Query Parameters</h2>
        <pre className="mt-3 whitespace-pre-wrap break-words text-sm">
{JSON.stringify(params, null, 2)}
        </pre>
      </div>

      <div className="mt-6 flex gap-3">
        <Link className="underline" href="/booking">
          Back to Booking
        </Link>
        <Link className="underline" href="/">
          Home
        </Link>
      </div>
    </main>
  );
}
