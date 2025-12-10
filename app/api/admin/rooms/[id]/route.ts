// app/api/rooms/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = params; // 这里保持 string，不要再 Number()

  const room = await prisma.room.findUnique({
    where: { id },
  });

  if (!room) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json({ data: room });
}
