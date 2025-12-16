// lib/admin-auth.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "walter_admin_session";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const AUTH_SECRET = process.env.AUTH_SECRET;

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function getJwtSecretKey() {
  if (!AUTH_SECRET) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(AUTH_SECRET);
}

async function verifyAdminCookie(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload?.role === "ADMIN";
  } catch {
    return false;
  }
}

/**
 * 后台接口统一校验：
 * 1) 优先验证 walter_admin_session JWT（浏览器登录通道）
 * 2) 备用：x-admin-secret === AUTH_SECRET（脚本/运维通道，可选）
 * 3) 备用：Basic Auth (email:password) 匹配 ADMIN_EMAIL/ADMIN_PASSWORD（可选）
 */
export async function requireAdmin(
  req: NextRequest,
): Promise<NextResponse | null> {
  // 1) Cookie JWT
  if (await verifyAdminCookie(req)) return null;

  // 2) Header secret（可选）
  const headerSecret = req.headers.get("x-admin-secret");
  if (headerSecret && AUTH_SECRET && safeEqual(headerSecret, AUTH_SECRET)) {
    return null;
  }

  // 3) Basic Auth（可选）
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Admin credentials not configured" },
      { status: 500 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const b64 = auth.slice(6).trim();
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf8");
      const idx = decoded.indexOf(":");
      if (idx > 0) {
        const email = decoded.slice(0, idx);
        const password = decoded.slice(idx + 1);
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return null;
        }
      }
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}