// lib/email.ts
// P0 目标：构建必过、生产可用、缺失配置时不阻断主流程（只跳过邮件发送）

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
};

type SendEmailResult =
  | { ok: true; provider: "resend"; id?: string }
  | { ok: true; provider: "noop"; reason: string }
  | { ok: false; provider: "resend"; status?: number; error: string };

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "booking@walter-farm.com";

/**
 * 发送邮件（Resend REST API）
 * - 若未配置 RESEND_API_KEY：返回 noop，不抛错（避免阻断下单/支付主链路）
 * - 若调用失败：返回 ok:false，让上层决定是否降级处理
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    return { ok: true, provider: "noop", reason: "RESEND_API_KEY not set" };
  }

  const payload: Record<string, unknown> = {
    from: RESEND_FROM_EMAIL,
    to: input.to,
    subject: input.subject,
  };

  if (input.html) payload.html = input.html;
  if (input.text) payload.text = input.text;
  if (input.replyTo) payload.reply_to = input.replyTo;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // 关键：不要缓存
      cache: "no-store",
    });

    const data = (await resp.json().catch(() => ({}))) as any;

    if (!resp.ok) {
      return {
        ok: false,
        provider: "resend",
        status: resp.status,
        error: data?.message || `Resend API error (status=${resp.status})`,
      };
    }

    return { ok: true, provider: "resend", id: data?.id };
  } catch (e: any) {
    return {
      ok: false,
      provider: "resend",
      error: e?.message || "Network error calling Resend",
    };
  }
}