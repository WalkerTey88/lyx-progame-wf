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

function getHitPayPaymentMethodsFromEnv(): string[] | undefined {
  // Example: HITPAY_PAYMENT_METHODS="fpx"
  const v = (process.env.HITPAY_PAYMENT_METHODS || "").trim();
  if (!v) return undefined;
  const arr = v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length ? arr : undefined;
}

function shouldFallbackWithoutPaymentMethods(err: unknown): boolean {
  const msg = (err as any)?.message ? String((err as any).message) : String(err || "");
  const m = msg.toLowerCase();
  // HitPay 常见报错：payment method unavailable / currency invalid
  if (m.includes("payment method") && (m.includes("unavailable") || m.includes("invalid"))) return true;
  if (m.includes("selected payment method") && m.includes("unavailable")) return true;
  if (m.includes("currency") && m.includes("invalid")) return true;
  return false;
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
  if (s === "canceled") return "CANCELLED";
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

  // Final states must NOT create new payment
  if (["CANCELLED", "COMPLETED", "PAID"].includes(booking.status as any)) {
    throw new Error(`Booking status is ${booking.status}. Payment is not allowed.`);
  }

  // If caller passes idempotencyKey, dedupe by it first
  if (input.idempotencyKey) {
    const existingByKey = await prisma.payment.findUnique({
      where: { idempotencyKey: String(input.idempotencyKey) },
    });
    if (existingByKey) {
      return {
        bookingId,
        paymentId: existingByKey.id,
        providerPaymentRequestId: existingByKey.providerPaymentRequestId,
        checkoutUrl: existingByKey.checkoutUrl ?? null,
        status: String(existingByKey.status),
      };
    }
  }

  // Reuse active payment
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

  // Critical: DO NOT force a fixed idempotencyKey by default (or you can never create a new payment after fail/expire)
  const idempotencyKey = input.idempotencyKey ? String(input.idempotencyKey) : null;

  const paymentMethods = getHitPayPaymentMethodsFromEnv(); // optional (e.g. ["fpx"])

  // 1) First try: honor env paymentMethods (force FPX if configured)
  // 2) If HitPay rejects (method unavailable / currency invalid): retry without paymentMethods
  let pr: any;
  try {
    pr = await hitpayCreatePaymentRequest({
      amountMYR: senToMYR(booking.totalPrice),
      currency: "MYR",
      name: booking.guestName,
      email: booking.guestEmail,
      phone: booking.guestPhone,
      purpose: "Walter Farm Booking",
      referenceNumber: bookingId,
      redirectUrl,
      webhookUrl,
      paymentMethods,
    });
  } catch (e) {
    if (paymentMethods && paymentMethods.length > 0 && shouldFallbackWithoutPaymentMethods(e)) {
      console.warn(
        "[ensureHitPayPaymentForBooking] payment_methods rejected, fallback to HitPay default methods. methods=",
        paymentMethods
      );

      pr = await hitpayCreatePaymentRequest({
        amountMYR: senToMYR(booking.totalPrice),
        currency: "MYR",
        name: booking.guestName,
        email: booking.guestEmail,
        phone: booking.guestPhone,
        purpose: "Walter Farm Booking",
        referenceNumber: bookingId,
        redirectUrl,
        webhookUrl,
        // no paymentMethods
      });
    } else {
      throw e;
    }
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      provider: "HITPAY",
      channel,
      status: mapHitPayToPaymentStatus(pr.status) as any,
      amount: booking.totalPrice,
      currency: "MYR",
      providerPaymentRequestId: pr.id,
      providerPaymentId: pr.payment_id ?? null,
      checkoutUrl: pr.url,
      idempotencyKey,
      rawCreateResponse: pr as any,
    },
  });

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
    if (e?.code !== "P2002") throw e;
    // duplicate webhook -> idempotent success
  }

  const payment = await prisma.payment.findUnique({
    where: { providerPaymentRequestId: parsed.paymentRequestId },
  });

  if (!payment) {
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