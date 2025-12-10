// lib/admin-auth.ts
import { NextRequest, NextResponse } from "next/server";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const AUTH_SECRET = process.env.AUTH_SECRET;
/**
* 后台接口调用入口统一校验：
*  - 优先检查 header: x-admin-secret === AUTH_SECRET
*  - 否则检查 Basic Auth (email:password) 是否匹配 ADMIN_EMAIL / ADMIN_PASSWORD
* 返回值：
*  - 返回 NextResponse => 说明已处理（401/500），路由应直接 return
*  - 返回 null => 通过验证，可以继续执行
*/
export function requireAdmin(req: NextRequest): NextResponse | null {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn("[admin-auth] ADMIN_EMAIL or ADMIN_PASSWORD not configured");
    return NextResponse.json(
      { error: "Admin credentials not configured" },
      { status: 500 },
    );
  }
  let ok = false;
  const headerSecret = req.headers.get("x-admin-secret");
  if (headerSecret && AUTH_SECRET && headerSecret === AUTH_SECRET) {
    ok = true;
  }
  const basicAuth = req.headers.get("authorization");
  if (!ok && basicAuth?.startsWith("Basic ")) {
    const b64 = basicAuth.slice(6).trim();
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf8");
      const [email, password] = decoded.split(":", 2);
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        ok = true;
      }
    } catch {
      // ignore
    }
  }
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}