// app/api/payments/hitpay/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ensureHitPayPaymentForBooking } from "@/lib/payment-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const bookingId = String(body.bookingId);
    const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey) : undefined;

    const result = await ensureHitPayPaymentForBooking({
      bookingId,
      channel: "ONLINE",
      idempotencyKey,
    });

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (e: any) {
    console.error("[POST /api/payments/hitpay/create] error:", e);
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
