// app/booking/pay/page.tsx
import PayClient from "./PayClient";

export default function Page({
  searchParams,
}: {
  searchParams?: { bookingId?: string; id?: string };
}) {
  const bookingId = searchParams?.bookingId || searchParams?.id || "";
  return <PayClient bookingId={bookingId} />;
}