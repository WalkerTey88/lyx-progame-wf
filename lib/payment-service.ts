import Stripe from 'stripe';
import { prisma } from './prisma';
import { sendBookingConfirmationEmail } from './email';
import type { Booking, Payment } from '@prisma/client';
import type { Buffer } from 'node:buffer';

// === 添加这个接口（解决 handleWebhookEvent 和 createPaymentIntent 不存在错误）===
export interface PaymentService {
  createStripeCheckoutSession(input: CreateStripeCheckoutSessionInput): Promise<{ id: string; url: string }>;
  reconcileStripeCheckoutSession(args: { sessionId: string }): Promise<any>;
  handleWebhookEvent(rawBody: Buffer, signature: string, secret: string): Promise<boolean>;
  createPaymentIntent(params: {
    amount: number;
    currency: string;
    bookingId: string;
    userId: string;
    metadata?: Record<string, string>;
  }): Promise<{ clientSecret: string }>;
}

// === 如果你想更严谨，可以添加这个输入类型（可选）===
export type CreateStripeCheckoutSessionInput = {
  bookingId: string;
  userId: string;
  successUrl?: string;
  cancelUrl?: string;
};