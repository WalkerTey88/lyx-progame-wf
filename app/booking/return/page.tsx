// app/booking/return/page.tsx
import { Suspense } from "react";
import ReturnClient from "./ReturnClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto py-12 px-4 text-center">
          Loading…
        </div>
      }
    >
      <ReturnClient />
    </Suspense>
  );
}