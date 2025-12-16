// lib/email.ts

import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.RESEND_FROM_EMAIL || "booking@walter-farm.com";

/**
 * 封装的邮件发送客户端。
 * 如果没有配置 RESEND_API_KEY，则不会真正发送邮件，只打印警告。
 */
const resend = resendApiKey ? new Resend(resendApiKey) : null;

if (!resendApiKey) {
  // 开发 / 测试环境可以接受，只是不会发邮件
  console.warn(
    "[email] RESEND_API_KEY is not set. Email sending is DISABLED in this environment."
  );
}

export interface SendBookingEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * 发送预订相关邮件（如预订确认邮件）。
 *
 * 返回统一结构：
 *  - { success: true, result: ... }   发送成功
 *  - { success: false, disabled: true }  邮件功能被禁用（无 API KEY）
 *  - { success: false, error }       调用 Resend 失败
 */
export async function sendBookingEmail(
  params: SendBookingEmailParams
): Promise<
  | { success: true; result: unknown }
  | { success: false; disabled: true }
  | { success: false; error: unknown }
> {
  const { to, subject, html } = params;

  // 没配置 Key：直接返回，不抛异常，避免阻断主业务流程
  if (!resend) {
    console.warn(
      "[email] Attempted to send email but RESEND_API_KEY is not configured."
    );
    return { success: false, disabled: true };
  }

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    return { success: true, result };
  } catch (error) {
    console.error("[email] Failed to send email via Resend:", error);
    return { success: false, error };
  }
}