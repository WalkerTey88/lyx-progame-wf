// lib/payment-service.ts
// Payment orchestration: Booking -> HitPay Payment Request -> Webhook -> Booking status update

import { prisma } from "@/lib/prisma";
import {
  hitpayCreatePaymentRequest,
  hitpayGetPaymentRequest,
  normalizeHitPayStatus,
  parseHitPayWebhookV1,
  senToMYR,
  sha256Hex,
  verifyHitPayWebhookV1,
} from "@/lib/hitpay";

type EnsurePaymentInput = {
  bookingId: string;
  channel?: "ONLINE" | "OFFLINE";
  idempotencyKey?: string;
};

type EnsurePaymentResult = {
  bookingId: string;
  paymentId: string;
  providerPaymentRequestId: string;
  checkoutUrl: string | null;
  status: string;
};

function getAppBaseUrl(): string {
  const v =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";
  if (!v) throw new Error("Missing APP_BASE_URL (or NEXT_PUBLIC_SITE_URL)");
  return v.replace(/\/$/, "");
}

function mapHitPayToPaymentStatus(hitpayStatus: string) {
  const s = normalizeHitPayStatus(hitpayStatus);
  if (s === "completed") return "COMPLETED";
  if (s === "failed") return "FAILED";
  if (s === "expired") return "EXPIRED";
  if (s === "canceled") return "CANCELLED";
  return "PENDING";
}

function mapHitPayToBookingStatus(hitpayStatus: string) {
  const s = normalizeHitPayStatus(hitpayStatus);
  if (s === "completed") return "PAID";
  if (s === "failed") return "PAYMENT_FAILED";
  if (s === "expired") return "EXPIRED";
  if (s === "canceled") return "PAYMENT_FAILED";
  return "PAYMENT_PENDING";
}

export async function ensureHitPayPaymentForBooking(
  input: EnsurePaymentInput
): Promise<EnsurePaymentResult> {
  const { bookingId } = input;
  const channel = input.channel || "ONLINE";

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!booking) throw new Error("Booking not found");

  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    throw new Error(`Booking status is ${booking.status}. Payment is not allowed.`);
  }

  const active = booking.payments.find((p) =>
    ["CREATED", "PENDING"].includes(p.status as any)
  );
  if (active) {
    return {
      bookingId,
      paymentId: active.id,
      providerPaymentRequestId: active.providerPaymentRequestId,
      checkoutUrl: active.checkoutUrl ?? null,
      status: String(active.status),
    };
  }

  const baseUrl = getAppBaseUrl();
  const redirectUrl = `${baseUrl}/booking/return?bookingId=${encodeURIComponent(bookingId)}`;
  const webhookUrl = `${baseUrl}/api/webhooks/hitpay`;

  const idempotencyKey = input.idempotencyKey || `HP:${bookingId}`;

  // Create HitPay payment request
  const pr = await hitpayCreatePaymentRequest({
    amountMYR: senToMYR(booking.totalPrice),
    currency: "MYR",
    name: booking.guestName,
    email: booking.guestEmail,
    phone: booking.guestPhone,
    purpose: "Walter Farm Booking",
    referenceNumber: bookingId,
    redirectUrl,
    webhookUrl,
  });

  // Persist payment
  const payment = await prisma.payment.create({
    data: {
      bookingId,
      provider: "HITPAY",
      channel,
      status: mapHitPayToPaymentStatus(pr.status) as any,
      amount: booking.totalPrice,
      currency: "MYR",
      providerPaymentRequestId: pr.id,
      checkoutUrl: pr.url,
      idempotencyKey,
      rawCreateResponse: pr as any,
    },
  });

  // Move booking to PAYMENT_PENDING
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "PAYMENT_PENDING" as any },
  });

  return {
    bookingId,
    paymentId: payment.id,
    providerPaymentRequestId: payment.providerPaymentRequestId,
    checkoutUrl: payment.checkoutUrl ?? null,
    status: String(payment.status),
  };
}

export async function applyHitPayWebhookV1(rawBody: string) {
  if (!verifyHitPayWebhookV1(rawBody)) {
    throw new Error("Invalid HitPay webhook signature");
  }

  const parsed = parseHitPayWebhookV1(rawBody);
  const payloadHash = sha256Hex(rawBody);

  // Idempotency: store event by payload hash
  try {
    await prisma.paymentEvent.create({
      data: {
        provider: "HITPAY",
        providerPaymentRequestId: parsed.paymentRequestId,
        providerPaymentId: parsed.paymentId,
        status: parsed.status,
        payloadHash,
        rawBody,
        parsed: parsed.params as any,
      },
    });
  } catch (e: any) {
    // Prisma unique violation => already processed
    if (e?.code !== "P2002") {
      throw e;
    }
    // Continue as idempotent success
  }

  const payment = await prisma.payment.findUnique({
    where: { providerPaymentRequestId: parsed.paymentRequestId },
  });

  if (!payment) {
    // Unknown payment request id. Still return 200 to stop retries,
    // but log it at route level.
    return { ok: true, ignored: true };
  }

  const newPaymentStatus = mapHitPayToPaymentStatus(parsed.status);
  const newBookingStatus = mapHitPayToBookingStatus(parsed.status);

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newPaymentStatus as any,
      providerPaymentId: parsed.paymentId ?? payment.providerPaymentId,
    },
  });

  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: newBookingStatus as any },
  });

  // attach paymentId to event if not yet
  await prisma.paymentEvent.updateMany({
    where: { payloadHash, paymentId: null },
    data: { paymentId: payment.id },
  });

  return { ok: true };
}

export async function refreshHitPayStatusForBooking(bookingId: string) {
  const payment = await prisma.payment.findFirst({
    where: { bookingId, provider: "HITPAY" },
    orderBy: { createdAt: "desc" },
  });
  if (!payment) throw new Error("No payment found for this booking");

  const pr = await hitpayGetPaymentRequest(payment.providerPaymentRequestId);
  const newPaymentStatus = mapHitPayToPaymentStatus(pr.status);
  const newBookingStatus = mapHitPayToBookingStatus(pr.status);

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newPaymentStatus as any,
      checkoutUrl: pr.url || payment.checkoutUrl,
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newBookingStatus as any },
  });

  return {
    bookingId,
    payment: {
      id: payment.id,
      providerPaymentRequestId: payment.providerPaymentRequestId,
      status: newPaymentStatus,
      checkoutUrl: pr.url || payment.checkoutUrl,
    },
    bookingStatus: newBookingStatus,
  };
}
