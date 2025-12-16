// app/api/payments/hitpay/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ensureHitPayPaymentForBooking } from "@/lib/payment-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 定位用：看 Vercel 运行时到底读到了什么
    console.log(
      "[hitpay/create] HITPAY_PAYMENT_METHODS =",
      process.env.HITPAY_PAYMENT_METHODS || "(empty)"
    );
    console.log(
      "[hitpay/create] HITPAY_API_BASE_URL =",
      process.env.HITPAY_API_BASE_URL || "(default)"
    );

    const body = (await req.json().catch(() => null)) as any;
    const bookingId = body?.bookingId ? String(body.bookingId) : "";

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const result = await ensureHitPayPaymentForBooking({
      bookingId,
      channel: "ONLINE",
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("[POST /api/payments/hitpay/create] error:", e);
    return NextResponse.json(
      { error: e?.message ? String(e.message) : "Internal Server Error" },
      { status: 500 }
    );
  }
}
