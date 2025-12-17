// lib/email.ts

import { Resend } from "resend";

function hasResend(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

function getResend(): Resend | null {
  if (!hasResend()) return null;
  return new Resend(process.env.RESEND_API_KEY as string);
}

export type SendBookingConfirmationEmailInput = {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;

  roomName?: string;
  checkIn: Date;
  checkOut: Date;

  amount: number; // smallest unit (sen)
  currency: string; // e.g. "myr"

  bookingLink: string;

  supportPhone: string; // 电话和 WhatsApp 相同
  supportEmail?: string;

  cancellationPolicyText?: string; // 只说明，不提供取消按钮
};

export type SendPaymentFailedEmailInput = {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;

  roomName?: string;
  checkIn?: Date;
  checkOut?: Date;

  amount?: number;
  currency?: string;

  bookingLink: string;

  supportPhone: string;
  supportEmail?: string;

  failureReason?: string;
  cancellationPolicyText?: string;
};

function fmtDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat("en-MY", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function money(amount: number, currency: string): string {
  const c = currency.toUpperCase();
  const v = Number(amount);
  const major = Number.isFinite(v) ? v / 100 : 0;
  return `${c} ${major.toFixed(2)}`;
}

function baseLayout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#111;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#ffffff;border:1px solid #e6e8eb;border-radius:12px;overflow:hidden;">
      <div style="padding:20px 20px 10px 20px;border-bottom:1px solid #eef0f2;">
        <div style="font-size:14px;color:#6b7280;">Walter Farm</div>
        <div style="font-size:20px;font-weight:700;margin-top:6px;">${title}</div>
        <div style="font-size:12px;color:#9ca3af;margin-top:8px;">
          Logo placeholder — add brand logo when UI assets are ready.
        </div>
      </div>

      <div style="padding:20px;">
        ${bodyHtml}
      </div>

      <div style="padding:16px 20px;border-top:1px solid #eef0f2;background:#fafbfc;">
        <div style="font-size:12px;color:#6b7280;">
          Need help? Call / WhatsApp: <strong>${process.env.SUPPORT_PHONE || ""}</strong>
        </div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">
          This is an automated email. Please do not reply.
        </div>
      </div>
    </div>

    <div style="text-align:center;font-size:12px;color:#9ca3af;margin-top:14px;">
      © ${new Date().getFullYear()} Walter Farm. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

export async function sendBookingConfirmationEmail(input: SendBookingConfirmationEmailInput) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND not configured. Skip sending confirmation email.");
    return { ok: false, skipped: true };
  }

  const subject = `Booking Confirmed — ${input.bookingId}`;

  const policy =
    input.cancellationPolicyText ||
    "Bookings cannot be cancelled by customers after confirmation. If you need assistance, please contact our support team.";

  const html = baseLayout(
    "Booking Confirmed",
    `
      <p style="margin:0 0 12px 0;font-size:14px;line-height:1.5;">
        Dear <strong>${input.customerName}</strong>, your booking has been confirmed.
      </p>

      <div style="border:1px solid #eef0f2;border-radius:10px;padding:14px;">
        <div style="font-size:13px;color:#6b7280;">Booking ID</div>
        <div style="font-family:ui-monospace,Menlo,Monaco,Consolas,monospace;margin-top:4px;">${input.bookingId}</div>

        <div style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap;">
          <div style="min-width:180px;">
            <div style="font-size:13px;color:#6b7280;">Room</div>
            <div style="margin-top:4px;">${input.roomName || "Room"}</div>
          </div>
          <div style="min-width:180px;">
            <div style="font-size:13px;color:#6b7280;">Stay</div>
            <div style="margin-top:4px;">${fmtDate(input.checkIn)} → ${fmtDate(input.checkOut)}</div>
          </div>
          <div style="min-width:180px;">
            <div style="font-size:13px;color:#6b7280;">Amount</div>
            <div style="margin-top:4px;"><strong>${money(input.amount, input.currency)}</strong></div>
          </div>
        </div>
      </div>

      <div style="margin-top:14px;">
        <a href="${input.bookingLink}"
           style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-size:14px;">
          View Booking
        </a>
      </div>

      <div style="margin-top:16px;font-size:12px;color:#6b7280;line-height:1.5;">
        <strong>Policy:</strong> ${policy}
      </div>
    `,
  );

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL as string,
    to: input.customerEmail,
    subject,
    html,
  });

  return { ok: true };
}

export async function sendPaymentFailedEmail(input: SendPaymentFailedEmailInput) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND not configured. Skip sending payment failed email.");
    return { ok: false, skipped: true };
  }

  const subject = `Payment Failed — ${input.bookingId}`;

  const policy =
    input.cancellationPolicyText ||
    "Bookings cannot be cancelled by customers after confirmation. If you need assistance, please contact our support team.";

  const detailLines: string[] = [];
  if (input.roomName) detailLines.push(`<div><strong>Room:</strong> ${input.roomName}</div>`);
  if (input.checkIn && input.checkOut)
    detailLines.push(`<div><strong>Stay:</strong> ${fmtDate(input.checkIn)} → ${fmtDate(input.checkOut)}</div>`);
  if (typeof input.amount === "number" && input.currency)
    detailLines.push(`<div><strong>Amount:</strong> ${money(input.amount, input.currency)}</div>`);

  const html = baseLayout(
    "Payment Failed",
    `
      <p style="margin:0 0 12px 0;font-size:14px;line-height:1.5;">
        Dear <strong>${input.customerName}</strong>, we could not complete your payment for the booking below.
      </p>

      <div style="border:1px solid #fee2e2;background:#fff7f7;border-radius:10px;padding:14px;">
        <div style="font-size:13px;color:#991b1b;"><strong>Reason:</strong> ${input.failureReason || "Payment was declined or could not be processed."}</div>
      </div>

      <div style="border:1px solid #eef0f2;border-radius:10px;padding:14px;margin-top:12px;">
        <div style="font-size:13px;color:#6b7280;">Booking ID</div>
        <div style="font-family:ui-monospace,Menlo,Monaco,Consolas,monospace;margin-top:4px;">${input.bookingId}</div>
        <div style="margin-top:10px;font-size:13px;line-height:1.6;">
          ${detailLines.join("") || "<div><strong>Details:</strong> Please open your booking link below.</div>"}
        </div>
      </div>

      <div style="margin-top:14px;">
        <a href="${input.bookingLink}"
           style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-size:14px;">
          Try Payment Again
        </a>
      </div>

      <div style="margin-top:16px;font-size:12px;color:#6b7280;line-height:1.5;">
        <strong>Support:</strong> Call / WhatsApp ${input.supportPhone}${input.supportEmail ? `, Email ${input.supportEmail}` : ""}<br/>
        <strong>Policy:</strong> ${policy}
      </div>
    `,
  );

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL as string,
    to: input.customerEmail,
    subject,
    html,
  });

  return { ok: true };
}