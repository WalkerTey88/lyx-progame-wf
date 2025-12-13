// app/api/webhooks/hitpay/route.ts
import { NextRequest, NextResponse } from "next/server";
import { applyHitPayWebhookV1 } from "@/lib/payment-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // HitPay webhook v1 is application/x-www-form-urlencoded. We must verify HMAC using HITPAY_SALT.
  try {
    const rawBody = await req.text();
    const result = await applyHitPayWebhookV1(rawBody);
    if ((result as any)?.ignored) {
      console.warn("[HitPay webhook] ignored: unknown payment_request_id");
    }
    // Always return 200 if signature is valid to stop retries
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("[POST /api/webhooks/hitpay] error:", e);
    // For invalid signature we return 400 to signal problem (HitPay may retry).
    return NextResponse.json(
      { error: e?.message || "Bad request" },
      { status: 400 }
    );
  }
}
