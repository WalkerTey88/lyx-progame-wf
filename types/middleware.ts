// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "walter_admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 只拦截 /admin 页面，不拦截 /api/admin
  const isAdminPage = pathname.startsWith("/admin");

  if (!isAdminPage) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // 没有会话 cookie，统一跳去 /login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 有 cookie，具体权限在页面或 API 里再做更细的校验
  return NextResponse.next();
}

export const config = {
  // 只匹配 /admin 下的页面路由
  matcher: ["/admin/:path*"],
};