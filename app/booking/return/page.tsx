// app/booking/return/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ReturnClient from "./ReturnClient";

export default function BookingReturnPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center">正在加载...</p>}>
      <ReturnClient />
    </Suspense>
  );
}