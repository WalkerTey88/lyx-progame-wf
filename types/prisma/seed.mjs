// prisma/seed.mjs

import { PrismaClient, UserRole, BookingStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");

  // 1) 管理员账号（开发用）
  const admin = await prisma.user.upsert({
    where: { email: "admin@walterfarm.local" },
    update: {},
    create: {
      email: "admin@walterfarm.local",
      name: "Walter Farm Admin",
      // 开发阶段临时密码，后面接入真正登录再改
      password: "admin123456789",
      role: UserRole.ADMIN,
    },
  });
  console.log("Admin ready:", admin.email);

  // 2) 房型数据（不再用 upsert(where.name），改成 findFirst + update/create）
  const roomTypesSeed = [
    {
      name: "Standard Room",
      description: "Standard room for 2 pax",
      basePrice: 15000, // RM 150.00（单位：分 / sen）
      capacity: 2,
      code: "ST",
    },
    {
      name: "Family Room",
      description: "Family room for 4 pax",
      basePrice: 26000, // RM 260.00（单位：分 / sen）
      capacity: 4,
      code: "FA",
    },
  ];

  for (const rt of roomTypesSeed) {
    const { code, ...roomTypeData } = rt;

    // 先查有没有同名的
    const existing = await prisma.roomType.findFirst({
      where: { name: roomTypeData.name },
    });

    let roomType;

    if (existing) {
      roomType = await prisma.roomType.update({
        where: { id: existing.id },
        data: {
          description: roomTypeData.description,
          basePrice: roomTypeData.basePrice,
          capacity: roomTypeData.capacity,
        },
      });
      console.log(`RoomType updated: ${roomType.name}`);
    } else {
      roomType = await prisma.roomType.create({
        data: {
          ...roomTypeData,
          images: [],
        },
      });
      console.log(`RoomType created: ${roomType.name}`);
    }

    // 每个房型 10 间房，避免重复（skipDuplicates）
    const roomsData = Array.from({ length: 10 }).map((_, index) => ({
      roomTypeId: roomType.id,
      roomNumber: `${code}-${String(index + 1).padStart(2, "0")}`, // ST-01, ST-02...
    }));

    await prisma.room.createMany({
      data: roomsData,
      skipDuplicates: true,
    });

    console.log(`Rooms ensured for ${roomType.name}: 10 units.`);
  }

  // 3) Demo 订单（方便前台 / Admin 调试）
  const standard = await prisma.roomType.findFirst({
    where: { name: "Standard Room" },
    include: { rooms: true },
  });

  if (standard && standard.rooms.length > 0) {
    const room = standard.rooms[0];

    const today = new Date();
    const checkIn = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7,
    );
    const checkOut = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 9,
    );

    await prisma.booking.create({
      data: {
        userId: admin.id,
        roomId: room.id,
        roomTypeId: standard.id,
        guestName: "Demo Guest",
        guestEmail: "guest@example.com",
        guestPhone: "0123456789",
        specialRequest: "Late check-in around 9pm.",
        checkIn,
        checkOut,
        totalPrice: standard.basePrice * 2,
        status: BookingStatus.PAID,
      },
    });

    console.log("Demo booking created.");
  } else {
    console.log("Skip demo booking: Standard Room or rooms not found.");
  }

  // 4) 统计
  const [userCount, roomTypeCount, roomCount, bookingCount] = await Promise.all([
    prisma.user.count(),
    prisma.roomType.count(),
    prisma.room.count(),
    prisma.booking.count(),
  ]);

  console.log("Seed finished:");
  console.log(`  Users:    ${userCount}`);
  console.log(`  RoomType: ${roomTypeCount}`);
  console.log(`  Rooms:    ${roomCount}`);
  console.log(`  Bookings: ${bookingCount}`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Prisma disconnected.");
  });