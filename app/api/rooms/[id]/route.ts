import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: Request, { params }: Params) {
  const { id } = params; // 保持 string，不要转 number

  const room = await prisma.room.findUnique({
    where: { id },
  });

  if (!room) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json({ data: room });
}
