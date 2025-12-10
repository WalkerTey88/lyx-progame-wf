// lib/auth.ts
import { cookies } from "next/headers";
import { jwtVerify, JWTPayload } from "jose";
import { prisma } from "./prisma";

const SESSION_COOKIE_NAME = "walter_admin_session";

function getJwtSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN" | "SUPERADMIN";
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    const userId = (payload as JWTPayload & { userId?: string }).userId;
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthUser["role"],
    };
  } catch {
    return null;
  }
}

export async function requireAdminUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
