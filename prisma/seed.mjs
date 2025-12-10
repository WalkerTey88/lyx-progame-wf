// prisma/seed.mjs
import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

function buildRoomNumber(prefix, index) {
  const num = String(index).padStart(2, "0");
  return `${prefix}-${num}`;
}

function buildDateRange(daysAhead) {
  const dates = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function isWeekend(d) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

async function main() {
  console.log("=== Walters Farm seed started ===");

  await prisma.booking.deleteMany();
  await prisma.roomBlockDate.deleteMany();
  await prisma.priceCalendar.deleteMany();
  await prisma.room.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.user.deleteMany();

  console.log("Base tables cleared.");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@walterfarm.local";

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Admin",
      password: null,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created: ${adminUser.email}`);

  const roomTypesSeed = [
    {
      code: "STD",
      name: "Standard Chalet",
      description: "Cozy chalet suitable for 2–3 pax with basic amenities.",
      basePrice: 18000,
      capacity: 3,
      images: ["/images/rooms/standard-1.jpg", "/images/rooms/standard-2.jpg"],
    },
    {
      code: "FAM",
      name: "Family Suite",
      description: "Family suite for 4–6 pax with living area.",
      basePrice: 26000,
      capacity: 6,
      images: ["/images/rooms/family-1.jpg", "/images/rooms/family-2.jpg"],
    },
    {
      code: "DORM",
      name: "Dormitory Room",
      description: "Dormitory-style room for groups/students (up to 8 pax).",
      basePrice: 12000,
      capacity: 8,
      images: ["/images/rooms/dorm-1.jpg"],
    },
  ];

  const roomTypes = [];

  for (const rt of roomTypesSeed) {
    const created = await prisma.roomType.create({
      data: {
        name: rt.name,
        description: rt.description,
        basePrice: rt.basePrice,
        capacity: rt.capacity,
        images: rt.images,
      },
    });

    roomTypes.push({ ...created, code: rt.code });

    console.log(`RoomType created: ${created.name} (${rt.code})`);

    const roomsToCreate = [];
    for (let i = 1; i <= 10; i++) {
      roomsToCreate.push({
        roomNumber: buildRoomNumber(rt.code, i),
        roomTypeId: created.id,
        isActive: true,
      });
    }

    await prisma.room.createMany({ data: roomsToCreate });
    console.log(`  -> ${roomsToCreate.length} rooms created for ${created.name}`);
  }

  const dates = buildDateRange(90);
  const priceRows = [];

  for (const rt of roomTypes) {
    for (const d of dates) {
      let price = rt.basePrice;
      if (isWeekend(d)) {
        price += 2000;
      }
      priceRows.push({
        roomTypeId: rt.id,
        date: d,
        price,
      });
    }
  }

  await prisma.priceCalendar.createMany({
    data: priceRows,
    skipDuplicates: true,
  });

  console.log(
    `PriceCalendar created: ${priceRows.length} rows for ${roomTypes.length} room types.`,
  );

  const blockStart = new Date();
  blockStart.setHours(0, 0, 0, 0);
  blockStart.setDate(blockStart.getDate() + 7);

  const blockDates = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(blockStart);
    d.setDate(blockStart.getDate() + i);
    blockDates.push({
      roomTypeId: roomTypes[0].id,
      roomId: null,
      date: d,
      reason: "Maintenance",
    });
  }

  await prisma.roomBlockDate.createMany({ data: blockDates });

  console.log(`RoomBlockDate created: ${blockDates.length} days blocked.`);

  const firstRoom = await prisma.room.findFirst({
    where: { roomTypeId: roomTypes[0].id },
  });

  if (firstRoom) {
    const demoCheckIn = new Date();
    demoCheckIn.setHours(0, 0, 0, 0);
    demoCheckIn.setDate(demoCheckIn.getDate() + 3);

    const demoCheckOut = new Date(demoCheckIn);
    demoCheckOut.setDate(demoCheckIn.getDate() + 2);

    const nights = 2;
    const demoTotalPrice = roomTypes[0].basePrice * nights;

    await prisma.booking.create({
      data: {
        roomId: firstRoom.id,
        roomTypeId: roomTypes[0].id,
        userId: adminUser.id,
        guestName: "Demo Guest",
        guestEmail: "guest@example.com",
        guestPhone: "+60123456789",
        checkIn: demoCheckIn,
        checkOut: demoCheckOut,
        totalPrice: demoTotalPrice,
        status: BookingStatus.PAID,
        specialRequest: "Demo booking created by seed script.",
      },
    });

    console.log("Demo booking created for first room type.");
  }

  console.log("=== Walters Farm seed completed successfully ===");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });