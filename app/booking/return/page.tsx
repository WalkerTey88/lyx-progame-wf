// app/booking/return/page.tsx
import { Suspense } from "react";
import ReturnClient from "./ReturnClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<p className="py-12 text-center">正在加载...</p>}>
      <ReturnClient />
    </Suspense>
  );
}