// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

const SESSION_COOKIE_NAME = "walter_admin_session";

function getJwtSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

// 这里写死一组 Admin 账号密码（可被 .env 覆盖）
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "admin@walterfarm.local";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? "admin123456789";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 只允许这一个 Admin 账号；其它一律拒绝
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 确保数据库里存在对应 Admin 用户（没有就创建，有就修正为 ADMIN 角色和当前密码）
    let user = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: "Walter Farm Admin",
          password: ADMIN_PASSWORD, // 简单明文版；后面你要的话我们再换成 hash
          role: "ADMIN",
        },
      });
    } else {
      // 保证角色和密码是我们期望的
      if (user.role !== "ADMIN" || user.password !== ADMIN_PASSWORD) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "ADMIN",
            password: ADMIN_PASSWORD,
          },
        });
      }
    }

    // 签发 JWT
    const token = await new SignJWT({
      userId: user.id,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(getJwtSecretKey());

    const res = NextResponse.json({ ok: true });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // 本地开发；上生产要改 true
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error("[AUTH_LOGIN_ERROR]", err);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
