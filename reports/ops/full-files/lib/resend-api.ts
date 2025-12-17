// lib/resend-api.ts
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 替换 HTML 模板中的变量占位符
 */
function fillTemplate(templatePath: string, variables: Record<string, string>): string {
  let html = fs.readFileSync(templatePath, 'utf8');
  for (const [key, value] of Object.entries(variables)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}

/**
 * 发送 Booking 成功确认邮件
 */
export async function sendBookingSuccessEmail({
  to,
  bookingId,
  customerName,
  checkInDate,
  checkOutDate,
  roomType,
  guestCount,
  totalAmount,
  paymentMethod,
  transactionId,
  bookingLink,
  contactNumber,
}: {
  to: string;
  bookingId: string;
  customerName: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  guestCount: string;
  totalAmount: string;
  paymentMethod: string;
  transactionId: string;
  bookingLink: string;
  contactNumber: string;
}) {
  try {
    const html = fillTemplate(path.join(__dirname, '../emails/booking-confirmed.html'), {
      bookingId,
      customerName,
      checkInDate,
      checkOutDate,
      roomType,
      guestCount,
      totalAmount,
      paymentMethod,
      transactionId,
      bookingLink,
      contactNumber,
    });

    await resend.emails.send({
      from: `Walter Farm <${process.env.EMAIL_FROM}>`,
      to,
      subject: `✅ Booking Confirmed - Walter Farm`,
      html,
    });

    console.log(`[email:booking-success] sent to ${to}`);
  } catch (err) {
    console.error(`[email:booking-success] failed for ${to}`, err);
  }
}

/**
 * 发送 Payment 失败提醒邮件
 */
export async function sendPaymentFailedEmail({
  to,
  bookingId,
  customerName,
  roomType,
  checkInDate,
  checkOutDate,
  totalAmount,
  retryPaymentLink,
  contactNumber,
}: {
  to: string;
  bookingId: string;
  customerName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  retryPaymentLink: string;
  contactNumber: string;
}) {
  try {
    const html = fillTemplate(path.join(__dirname, '../emails/payment-failed.html'), {
      bookingId,
      customerName,
      roomType,
      checkInDate,
      checkOutDate,
      totalAmount,
      retryPaymentLink,
      contactNumber,
    });

    await resend.emails.send({
      from: `Walter Farm <${process.env.EMAIL_FROM}>`,
      to,
      subject: `❌ Payment Failed - Walter Farm`,
      html,
    });

    console.log(`[email:payment-failed] sent to ${to}`);
  } catch (err) {
    console.error(`[email:payment-failed] failed for ${to}`, err);
  }
}
