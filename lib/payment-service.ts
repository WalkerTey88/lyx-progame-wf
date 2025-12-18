import { prisma } from "@/lib/prisma";

export type PaymentChannel = "stripe" | "fpx" | "tng" | "duitnow";

export interface CreatePaymentInput {
  bookingId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  fpxBankCode?: string;
  tngWalletId?: string;
  duitnowProxyId?: string;
  channel?: PaymentChannel;
  status?: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  channel: PaymentChannel;
  status: string;
  externalId?: string | null;
  metadata?: any;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEvent {
  type: string;
  data: any;
}

export class PaymentService {
  async createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
    const {
      bookingId,
      amount,
      currency,
      stripePaymentIntentId,
      fpxBankCode,
      tngWalletId,
      duitnowProxyId,
      channel = "stripe",
      status = "pending",
    } = input;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency,
        channel,
        status,
        externalId: stripePaymentIntentId || fpxBankCode || tngWalletId || duitnowProxyId,
        expiresAt,
        metadata: {
          stripePaymentIntentId,
          fpxBankCode,
          tngWalletId,
          duitnowProxyId,
          createdAt: new Date().toISOString(),
        },
      },
    });

    console.log(`Payment created: ${payment.id} for booking ${bookingId}`);
    return payment as PaymentRecord;
  }

  async handleWebhook(event: WebhookEvent): Promise<void> {
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data as any;
        await this.updatePaymentStatus(
          paymentIntent.id,
          "succeeded",
          paymentIntent
        );
        await this.updateBookingStatus(paymentIntent.metadata?.bookingId, "confirmed");
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data as any;
        await this.updatePaymentStatus(
          failedIntent.id,
          "failed",
          failedIntent
        );
        break;

      case "charge.refunded":
        const charge = event.data as any;
        await this.updatePaymentStatus(
          charge.payment_intent,
          "refunded",
          charge
        );
        break;

      default:
        console.warn(`Unhandled webhook type: ${event.type}`);
    }
  }

  private async updatePaymentStatus(
    externalId: string,
    status: string,
    rawData: any
  ): Promise<void> {
    await prisma.payment.updateMany({
      where: { externalId },
      data: {
        status,
        metadata: {
          ...rawData,
          webhookProcessedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      },
    });
    console.log(`Updated payment ${externalId} to status: ${status}`);
  }

  private async updateBookingStatus(
    bookingId: string | undefined,
    status: string
  ): Promise<void> {
    if (!bookingId) return;

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
    console.log(`Updated booking ${bookingId} to status: ${status}`);
  }
}
