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

const webhookSecret = mustEnv("STRIPE_WEBHOOK_SECRET");

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const paymentService = new PaymentService();

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
        await paymentService.handleWebhook({
          type: "payment_intent.succeeded",
          data: paymentIntentSucceeded,
        });
        break;
      case "payment_intent.payment_failed":
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
        await paymentService.handleWebhook({
          type: "payment_intent.payment_failed",
          data: paymentIntentFailed,
        });
        break;
      case "charge.refunded":
        const chargeRefunded = event.data.object as Stripe.Charge;
        await paymentService.handleWebhook({
          type: "charge.refunded",
          data: chargeRefunded,
        });
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
