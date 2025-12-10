#!/usr/bin/env bash
set -e

ROOT="walter-farm-v2"

echo ">>> [lib] 生成 lib/* ..."

mkdir -p "$ROOT/lib"

########################################
# lib/prisma.ts
########################################
cat <<'EOF' > "$ROOT/lib/prisma.ts"
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
EOF

########################################
# lib/api.ts
########################################
cat <<'EOF' > "$ROOT/lib/api.ts"
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T, B = unknown>(path: string, body: B): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}
EOF

########################################
# lib/date-utils.ts
########################################
cat <<'EOF' > "$ROOT/lib/date-utils.ts"
export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function eachDayOfInterval(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (current <= last) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}
EOF

########################################
# lib/auth.ts
########################################
cat <<'EOF' > "$ROOT/lib/auth.ts"
import { SignJWT, jwtVerify } from "jose";
import type { AdminRole } from "@prisma/client";

const SECRET = process.env.ADMIN_JWT_SECRET;
if (!SECRET) {
  console.warn("ADMIN_JWT_SECRET is not set. Admin auth may fail.");
}
const key = SECRET ? new TextEncoder().encode(SECRET) : undefined;

export interface AdminTokenPayload {
  sub: number;
  email: string;
  role: AdminRole;
  name: string;
}

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  if (!key) throw new Error("ADMIN_JWT_SECRET is missing");
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
  return jwt;
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}
EOF

########################################
# lib/email.ts
########################################
cat <<'EOF' > "$ROOT/lib/email.ts"
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
`.trim()
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
`.trim()
  });
}
EOF

echo ">>> [lib] 完成"
