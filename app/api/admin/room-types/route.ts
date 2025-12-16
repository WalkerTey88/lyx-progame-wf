// app/api/admin/room-types/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    const roomTypes = await prisma.roomType.findMany({
      include: {
        _count: {
          select: { rooms: true },
        },
      },
      orderBy: {
        basePrice: "asc",
      },
    });

    return NextResponse.json({
      roomTypes: roomTypes.map((rt) => ({
        id: rt.id,
        name: rt.name,
        description: rt.description,
        basePrice: rt.basePrice,
        capacity: rt.capacity,
        totalRooms: rt._count.rooms,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/room-types error", error);
    return NextResponse.json(
      { error: "Failed to load room types." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { name, description, basePrice, capacity } = body as {
      name?: string;
      description?: string | null;
      basePrice?: number;
      capacity?: number;
    };

    if (
      !name ||
      typeof basePrice !== "number" ||
      typeof capacity !== "number"
    ) {
      return NextResponse.json(
        {
          error: "name, basePrice (number) and capacity (number) are required.",
        },
        { status: 400 }
      );
    }

    const roomType = await prisma.roomType.create({
      data: {
        name,
        description: description ?? null,
        basePrice,
        capacity,
        images: [],
      },
    });

    return NextResponse.json({ roomType }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/room-types error", error);
    return NextResponse.json(
      { error: "Failed to create room type." },
      { status: 500 }
    );
  }
}