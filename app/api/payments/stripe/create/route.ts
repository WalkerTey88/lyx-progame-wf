// app/api/payments/stripe/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { paymentService } from "@/lib/payment-service";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const bookingId =
      (typeof body?.bookingId === "string" && body.bookingId) ||
      req.nextUrl.searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { roomType: true, room: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 你业务是“客户可下订并支付”，不强制登录，所以这里不依赖 next-auth session

    const stripe = new Stripe(mustEnv("STRIPE_SECRET_KEY"), {
      // 你之前遇到 apiVersion union 不匹配，所以这里用 any 避免 TS 卡死
      apiVersion: ("2025-12-15.clover" as any),
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      req.nextUrl.origin;

    const currency = (process.env.BOOKING_CURRENCY || "myr").toLowerCase();

    // 约定：totalPrice 存的是最小货币单位（例如 MYR 的 sen），否则请改成 Math.round(totalPrice * 100)
    const amount = Number(booking.totalPrice);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid booking amount" }, { status: 400 });
    }

    const roomLabel =
      booking.roomType?.name ||
      (booking.room ? `Room ${booking.room.roomNumber}` : "Room");

    // 由 paymentService 负责：写 Payment 记录 + 置 booking 为 PAYMENT_PENDING
    const checkout = await paymentService.createStripeCheckoutSession({
      stripe,
      bookingId: booking.id,
      currency,
      amount,
      roomLabel,
      baseUrl,
    });

    return NextResponse.json({ url: checkout.url }, { status: 200 });
  } catch (err: any) {
    console.error("stripe/create error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 },
    );
  }
}