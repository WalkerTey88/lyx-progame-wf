// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "walter_admin_session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
