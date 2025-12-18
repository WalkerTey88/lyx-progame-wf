import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PaymentService } from "@/lib/payment-service";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

const stripe = new Stripe(mustEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount, currency } = await request.json();

    if (!bookingId || !amount || !currency) {
      return NextResponse.json(
        { error: "Missing bookingId, amount, or currency" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: {
        bookingId: bookingId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    const paymentService = new PaymentService();
    const dbPayment = await paymentService.createPayment({
      bookingId,
      amount,
      currency,
      stripePaymentIntentId: paymentIntent.id,
      status: "pending",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: dbPayment.id,
    });
  } catch (error: any) {
    console.error("Error creating Stripe payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}
