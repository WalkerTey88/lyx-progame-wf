// app/api/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "PAID",
  "COMPLETED",
];

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildDateRange(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const cursor = new Date(start);
  while (cursor < end) {
    result.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const roomTypeId = body?.roomTypeId as string | undefined;
    const from = parseDate(body?.from);
    const to = parseDate(body?.to);

    if (!roomTypeId || !from || !to) {
      return NextResponse.json(
        { error: "roomTypeId, from, to are required" },
        { status: 400 },
      );
    }

    if (to <= from) {
      return NextResponse.json(
        { error: "`to` must be later than `from`" },
        { status: 400 },
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        roomTypeId,
        status: { in: ACTIVE_BOOKING_STATUSES },
        NOT: {
          OR: [
            { checkOut: { lte: from } },
            { checkIn: { gte: to } },
          ],
        },
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
    });

    const blockedSet = new Set<string>();

    for (const b of bookings) {
      const start = new Date(b.checkIn);
      start.setHours(0, 0, 0, 0);

      const end = new Date(b.checkOut);
      end.setHours(0, 0, 0, 0);

      const range = buildDateRange(start, end);
      for (const d of range) {
        if (d >= from && d < to) {
          blockedSet.add(toKey(d));
        }
      }
    }

    const blockedDates = Array.from(blockedSet).sort();
    return NextResponse.json({ blockedDates });
  } catch (error) {
    console.error("[availability] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}