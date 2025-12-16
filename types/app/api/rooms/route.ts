import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 需要实时查库的 API，标记为动态，避免静态预渲染阶段访问数据库
export const dynamic = "force-dynamic";

export async function GET() {
  const rooms = await prisma.room.findMany({
    orderBy: { id: "asc" },
  });

  return NextResponse.json({ data: rooms });
}
