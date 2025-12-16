// lib/hitpay.ts
// HitPay Online Payments (Payment Request API + Webhook v1)
//
// References (HitPay docs):
// - Create Payment Request: POST /v1/payment-requests (application/json, X-BUSINESS-API-KEY)
// - Get Payment Request Status: GET /v1/payment-requests/{request_id}
// - Webhook v1: application/x-www-form-urlencoded payload + HMAC validation using your salt

import crypto from "crypto";

export type HitPayEnv = {
  apiKey: string;
  salt: string;
  apiBaseUrl: string; // e.g. https://api.hit-pay.com or https://api.sandbox.hit-pay.com
};

export type HitPayCreatePaymentRequestInput = {
  amountMYR: string; // e.g. "599.00"
  currency: string; // "MYR"
  name?: string;
  email?: string;
  phone?: string;
  purpose?: string;
  referenceNumber: string; // map to internal booking id
  redirectUrl: string;
  webhookUrl: string;

  // Optional: restrict available payment methods supported by your account, e.g. ["fpx"]
  paymentMethods?: string[];
};

export type HitPayPaymentRequest = {
  id: string;
  status: string; // pending | completed | failed | expired | ...
  url: string;
  amount: string;
  currency: string;
  reference_number?: string;
  payment_methods?: string[];
  payment_id?: string;
};

function getEnv(): HitPayEnv {
  const apiKey = process.env.HITPAY_API_KEY || "";
  const salt = process.env.HITPAY_SALT || "";
  const apiBaseUrl =
    process.env.HITPAY_API_BASE_URL ||
    "https://api.hit-pay.com"; // production default

  if (!apiKey) throw new Error("Missing HITPAY_API_KEY");
  if (!salt) throw new Error("Missing HITPAY_SALT");
  return { apiKey, salt, apiBaseUrl };
}

export function senToMYR(amountSen: number): string {
  // Convert minor unit (sen) to string with 2 decimals, e.g. 59900 -> "599.00"
  const v = Math.round(amountSen);
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  const myr = Math.floor(abs / 100);
  const sen = abs % 100;
  return `${sign}${myr}.${String(sen).padStart(2, "0")}`;
}

export async function hitpayCreatePaymentRequest(
  input: HitPayCreatePaymentRequestInput
): Promise<HitPayPaymentRequest> {
  const { apiKey, apiBaseUrl } = getEnv();

  const url = `${apiBaseUrl.replace(/\/$/, "")}/v1/payment-requests`;

  const amountNumber = Number(input.amountMYR);
  if (!Number.isFinite(amountNumber)) {
    throw new Error(`Invalid amountMYR: ${input.amountMYR}`);
  }

  // HitPay current docs accept JSON payload (recommended).
  const payload: any = {
    amount: amountNumber,
    currency: input.currency,
    reference_number: input.referenceNumber,
    redirect_url: input.redirectUrl,
    webhook: input.webhookUrl,
    send_email: false,
    send_sms: false,
  };

  if (input.purpose) payload.purpose = input.purpose;
  if (input.name) payload.name = input.name;
  if (input.email) payload.email = input.email;
  if (input.phone) payload.phone = input.phone;

  // Key change: allow forcing payment methods (e.g. FPX)
  if (input.paymentMethods && input.paymentMethods.length > 0) {
    payload.payment_methods = input.paymentMethods;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-BUSINESS-API-KEY": apiKey,
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok) {
    const msg = json?.message || json?.error || `HitPay create failed (${res.status})`;
    throw new Error(msg);
  }

  if (!json?.id || !json?.url) {
    throw new Error("HitPay response missing id/url");
  }

  return {
    id: String(json.id),
    status: String(json.status || "pending"),
    url: String(json.url),
    amount: String(json.amount ?? input.amountMYR),
    currency: String(json.currency ?? input.currency),
    reference_number: json.reference_number ? String(json.reference_number) : undefined,
    payment_methods: Array.isArray(json.payment_methods) ? json.payment_methods.map(String) : undefined,
    payment_id: json.payment_id ? String(json.payment_id) : undefined,
  };
}

export async function hitpayGetPaymentRequest(
  requestId: string
): Promise<HitPayPaymentRequest> {
  const { apiKey, apiBaseUrl } = getEnv();
  const url = `${apiBaseUrl.replace(/\/$/, "")}/v1/payment-requests/${encodeURIComponent(requestId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-BUSINESS-API-KEY": apiKey,
    },
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok) {
    const msg = json?.message || json?.error || `HitPay get status failed (${res.status})`;
    throw new Error(msg);
  }

  if (!json?.id || !json?.url) {
    throw new Error("HitPay status response missing id/url");
  }

  return {
    id: String(json.id),
    status: String(json.status || "pending"),
    url: String(json.url),
    amount: String(json.amount || "0.00"),
    currency: String(json.currency || "MYR"),
    reference_number: json.reference_number ? String(json.reference_number) : undefined,
    payment_methods: Array.isArray(json.payment_methods) ? json.payment_methods.map(String) : undefined,
    payment_id: json.payment_id ? String(json.payment_id) : undefined,
  };
}

function timingSafeEqualHex(aHex: string, bHex: string): boolean {
  try {
    const a = Buffer.from(aHex, "hex");
    const b = Buffer.from(bHex, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export type HitPayWebhookV1 = {
  rawBody: string;
  params: Record<string, string>;
  paymentRequestId: string;
  paymentId?: string;
  status: string;
  referenceNumber?: string;
};

export function parseHitPayWebhookV1(rawBody: string): HitPayWebhookV1 {
  const sp = new URLSearchParams(rawBody);

  const params: Record<string, string> = {};
  for (const [k, v] of sp.entries()) params[k] = v;

  const paymentRequestId = params["payment_request_id"] || "";
  const status = params["status"] || "";
  if (!paymentRequestId || !status) {
    throw new Error("Invalid HitPay webhook payload: missing payment_request_id/status");
  }

  return {
    rawBody,
    params,
    paymentRequestId,
    paymentId: params["payment_id"] || undefined,
    status,
    referenceNumber: params["reference_number"] || undefined,
  };
}

export function verifyHitPayWebhookV1(rawBody: string): boolean {
  const { salt } = getEnv();
  const sp = new URLSearchParams(rawBody);

  const receivedHmac = sp.get("hmac") || "";
  if (!receivedHmac) return false;

  // Build payload: remove hmac, sort keys, concatenate key + value
  const entries: [string, string][] = [];
  for (const [k, v] of sp.entries()) {
    if (k === "hmac") continue;
    entries.push([k, v]);
  }
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  let payload = "";
  for (const [k, v] of entries) payload += `${k}${v}`;

  const computed = crypto.createHmac("sha256", salt).update(payload).digest("hex");
  return timingSafeEqualHex(computed, receivedHmac);
}

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function normalizeHitPayStatus(
  status: string
): "pending" | "completed" | "failed" | "expired" | "canceled" {
  const s = String(status || "").toLowerCase();
  if (s === "completed" || s === "succeeded") return "completed";
  if (s === "failed") return "failed";
  if (s === "expired") return "expired";
  if (s === "canceled" || s === "cancelled") return "canceled";
  return "pending";
}