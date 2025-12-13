// app/booking/pay/page.tsx
import PayClient from "./PayClient";

export default function Page({
  searchParams,
}: {
  searchParams?: { bookingId?: string; id?: string };
}) {
  // 兼容：/booking/pay?bookingId=xxx 以及历史 /booking/pay?id=xxx
  const bookingId = searchParams?.bookingId || searchParams?.id || "";
  return <PayClient bookingId={bookingId} />;
}