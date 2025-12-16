// app/api/payments/hitpay/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refreshHitPayStatusForBooking } from "@/lib/payment-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId") || "";
    const refresh = (searchParams.get("refresh") || "false") === "true";

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    if (refresh) {
      const refreshed = await refreshHitPayStatusForBooking(bookingId);
      return NextResponse.json({ data: refreshed }, { status: 200 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const payment = booking.payments[0] || null;

    return NextResponse.json(
      {
        data: {
          bookingId,
          bookingStatus: booking.status,
          payment: payment
            ? {
                id: payment.id,
                provider: payment.provider,
                channel: payment.channel,
                status: payment.status,
                providerPaymentRequestId: payment.providerPaymentRequestId,
                checkoutUrl: payment.checkoutUrl,
              }
            : null,
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("[GET /api/payments/hitpay/status] error:", e);
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
