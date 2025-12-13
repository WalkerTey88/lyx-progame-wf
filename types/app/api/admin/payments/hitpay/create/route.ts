// app/api/admin/payments/hitpay/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { ensureHitPayPaymentForBooking } from "@/lib/payment-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  try {
    const body = await req.json().catch(() => null);
    if (!body?.bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const bookingId = String(body.bookingId);
    const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey) : undefined;

    const result = await ensureHitPayPaymentForBooking({
      bookingId,
      channel: "OFFLINE",
      idempotencyKey,
    });

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (e: any) {
    console.error("[POST /api/admin/payments/hitpay/create] error:", e);
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
