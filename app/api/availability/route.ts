import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, eachDayOfInterval } from "@/lib/date-utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomIdParam = searchParams.get("roomId");
  if (!roomIdParam) {
    return new NextResponse("Missing roomId", { status: 400 });
  }
  const roomId = Number(roomIdParam);

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return new NextResponse("Room not found", { status: 404 });

  const today = new Date();
  const end = addDays(today, 29);
  const bookings = await prisma.booking.findMany({
    where: {
      roomId,
      status: "CONFIRMED",
    },
  });

  const days = eachDayOfInterval(today, end).map((d) => {
    const dateStr = d.toISOString().slice(0, 10);
    const bookedUnits = bookings.filter((b) => {
      const ci = b.checkIn.toISOString().slice(0, 10);
      const co = b.checkOut.toISOString().slice(0, 10);
      return dateStr >= ci && dateStr < co;
    }).length;

    const availableUnits = Math.max(room.totalUnits - bookedUnits, 0);

    return {
      date: dateStr,
      bookedUnits,
      availableUnits,
    };
  });

  return NextResponse.json(days);
}
