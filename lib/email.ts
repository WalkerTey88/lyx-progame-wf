import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "booking@walter-farm.com";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendBookingCreatedEmail(params: {
  to: string;
  guestName: string;
  bookingId: number;
  checkIn: string;
  checkOut: string;
  amount: number;
}) {
  if (!resend) return;
  await resend.emails.send({
    from: `Walter Farm <${fromEmail}>`,
    to: [params.to],
    subject: `Booking Received - Walter Farm #${params.bookingId}`,
    text: `
Dear ${params.guestName},

Thank you for your booking at Walter Farm.

Booking ID: ${params.bookingId}
Check-in: ${params.checkIn}
Check-out: ${params.checkOut}
Amount: RM ${params.amount}

We will confirm your booking after successful payment.

Regards,
Walter Farm
`.trim(),
  });
}

export async function sendPaymentSuccessEmail(params: {
  to: string;
  guestName: string;
  bookingId: number;
  amount: number;
}) {
  if (!resend) return;
  await resend.emails.send({
    from: `Walter Farm <${fromEmail}>`,
    to: [params.to],
    subject: `Payment Successful - Walter Farm #${params.bookingId}`,
    text: `
Dear ${params.guestName},

Your payment for booking #${params.bookingId} has been received.

Amount: RM ${params.amount}

We look forward to welcoming you at Walter Farm.

Regards,
Walter Farm
`.trim(),
  });
}
