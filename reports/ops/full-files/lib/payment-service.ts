// lib/payment-service.ts

import Stripe from "stripe";
import { prisma } from "./prisma";
import {
  BookingStatus,
  PaymentProvider,
  PaymentStatus as PrismaPaymentStatus,
} from "@prisma/client";
import {
  sendBookingConfirmationEmail,
  sendPaymentFailedEmail,
} from "./email";

type CreateStripeCheckoutSessionInput = {
  stripe: Stripe;
  bookingId: string;
  currency: string; // lower case e.g. "myr"
  amount: number; // smallest unit
  roomLabel: string;
  baseUrl: string;
};

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function safeJson(obj: any) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return { message: "non-serializable payload" };
  }
}

// Stripe 的各种 status / payment_status 映射到 Prisma 的 PaymentStatus
function mapStripeStatusToPaymentStatus(stripeStatus: string | null | undefined): PrismaPaymentStatus {
  const v = String(stripeStatus || "").toLowerCase();

  // Stripe Checkout Session.payment_status: unpaid | paid | no_payment_required
  if (v === "paid" || v === "succeeded") return PrismaPaymentStatus.SUCCEEDED;

  // 常见“处理中”
  if (v === "processing") return PrismaPaymentStatus.PROCESSING;

  // 取消 / 失败
  if (v === "canceled" || v === "cancelled") return PrismaPaymentStatus.CANCELED;
  if (v === "failed") return PrismaPaymentStatus.FAILED;

  // 默认未支付 / 待支付
  if (v === "unpaid" || v === "requires_payment_method" || v === "requires_action") {
    return PrismaPaymentStatus.PENDING;
  }

  return PrismaPaymentStatus.PENDING;
}

async function markBookingStatusForPayment(bookingId: string, status: BookingStatus) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
}

export const paymentService = {
  async createStripeCheckoutSession(input: CreateStripeCheckoutSessionInput) {
    const { stripe, bookingId, currency, amount, roomLabel, baseUrl } = input;

    // 读取 booking（保证存在）
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { roomType: true, room: true, user: true },
    });
    if (!booking) throw new Error("Booking not found");

    // 先把 booking 推进到 PAYMENT_PENDING（闭环状态机）
    await markBookingStatusForPayment(bookingId, BookingStatus.PAYMENT_PENDING);

    // Stripe success / cancel 都回到 return（你的业务不提供“取消预订”，这里只是支付返回页）
    const successUrl = `${baseUrl}/booking/return?bookingId=${bookingId}&status=success`;
    const cancelUrl = `${baseUrl}/booking/return?bookingId=${bookingId}&status=cancel`;

    // 创建 Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: `Walter Farm Booking - ${roomLabel}`,
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bookingId,
      },
    });

    // 写 Payment 记录（字段名按你 drift 里一致：providerPaymentRequestId）
    // 若你 schema 字段不同（例如 providerPaymentId），这里需要你按 schema 改一下字段名。
    await prisma.payment.create({
      data: {
        bookingId,
        provider: PaymentProvider.STRIPE,
        status: PrismaPaymentStatus.PENDING,
        amount,
        currency: currency.toUpperCase(),
        providerPaymentRequestId: session.id,
        idempotencyKey: `stripe:${bookingId}:${session.id}`,
      },
    });

    return { id: session.id, url: session.url };
  },

  // 给 webhook 调用：根据 Stripe Session 更新 Payment / Booking
  async reconcileStripeCheckoutSession(args: {
    bookingId: string;
    providerPaymentRequestId: string;
    stripePaymentStatus?: string | null;
    stripeSessionRaw?: any;
    lastPaymentError?: any;
  }) {
    const { bookingId, providerPaymentRequestId, stripePaymentStatus, stripeSessionRaw, lastPaymentError } = args;

    const mapped = mapStripeStatusToPaymentStatus(stripePaymentStatus);

    // 更新 Payment
    const payment = await prisma.payment.findFirst({
      where: {
        bookingId,
        provider: PaymentProvider.STRIPE,
        providerPaymentRequestId,
      },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: mapped,
          metadata: safeJson({
            stripe: safeJson(stripeSessionRaw),
            stripeError: safeJson(lastPaymentError),
            reconciledAt: new Date().toISOString(),
          }),
        },
      });
    }

    // Booking 状态闭环
    if (mapped === PrismaPaymentStatus.SUCCEEDED) {
      await markBookingStatusForPayment(bookingId, BookingStatus.PAID);

      // 发确认邮件（Resend 未配置会自动 skip，不影响主流程）
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { roomType: true, room: true },
      });

      if (booking) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "";
        const supportPhone = mustEnv("SUPPORT_PHONE");
        await sendBookingConfirmationEmail({
          bookingId: booking.id,
          customerName: booking.guestName,
          customerEmail: booking.guestEmail,
          customerPhone: booking.guestPhone || undefined,
          roomName: booking.roomType?.name || (booking.room ? `Room ${booking.room.roomNumber}` : "Room"),
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          amount: Number(booking.totalPrice),
          currency: (booking.currency || "MYR").toLowerCase(),
          bookingLink: `${baseUrl}/booking/${booking.id}`,
          supportPhone,
          supportEmail: process.env.SUPPORT_EMAIL || undefined,
        });
      }

      return;
    }

    if (mapped === PrismaPaymentStatus.FAILED || mapped === PrismaPaymentStatus.CANCELED) {
      await markBookingStatusForPayment(bookingId, BookingStatus.PAYMENT_FAILED);

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { roomType: true, room: true },
      });

      if (booking) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "";
        const supportPhone = mustEnv("SUPPORT_PHONE");
        await sendPaymentFailedEmail({
          bookingId: booking.id,
          customerName: booking.guestName,
          customerEmail: booking.guestEmail,
          customerPhone: booking.guestPhone || undefined,
          roomName: booking.roomType?.name || (booking.room ? `Room ${booking.room.roomNumber}` : "Room"),
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          amount: Number(booking.totalPrice),
          currency: (booking.currency || "MYR").toLowerCase(),
          bookingLink: `${baseUrl}/booking/${booking.id}`,
          supportPhone,
          supportEmail: process.env.SUPPORT_EMAIL || undefined,
          failureReason: lastPaymentError?.message || "Payment was declined or could not be processed.",
        });
      }

      return;
    }

    // 其余状态：保持 PAYMENT_PENDING
    await markBookingStatusForPayment(bookingId, BookingStatus.PAYMENT_PENDING);
  },
};