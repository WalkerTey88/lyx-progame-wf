import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id);
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ data: room });
}
