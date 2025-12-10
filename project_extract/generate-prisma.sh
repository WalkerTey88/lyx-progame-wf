#!/usr/bin/env bash
set -e

ROOT="walter-farm-v2"

echo ">>> [prisma] 生成 prisma/schema.prisma + seed.mjs ..."

mkdir -p "$ROOT/prisma"

########################################
# prisma/schema.prisma
########################################
cat <<'EOF' > "$ROOT/prisma/schema.prisma"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Room {
  id            Int       @id @default(autoincrement())
  name          String
  slug          String    @unique
  description   String
  pricePerNight Int
  capacity      Int
  bedType       String
  imageUrl      String?
  totalUnits    Int       @default(1)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  bookings      Booking[]
}

model Booking {
  id              Int      @id @default(autoincrement())
  guestName       String
  guestEmail      String
  guestPhone      String
  roomId          Int
  checkIn         DateTime
  checkOut        DateTime
  guests          Int
  amount          Int
  status          BookingStatus   @default(PENDING)
  paymentStatus   PaymentStatus   @default(PENDING)
  paymentProvider String?
  paymentReference String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  room Room @relation(fields: [roomId], references: [id])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model AdminUser {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  passwordHash String
  name         String
  role         AdminRole @default(STAFF)
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

enum AdminRole {
  OWNER
  MANAGER
  STAFF
}
EOF

########################################
# prisma/seed.mjs
########################################
cat <<'EOF' > "$ROOT/prisma/seed.mjs"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roomsCount = await prisma.room.count();
  if (roomsCount === 0) {
    await prisma.room.createMany({
      data: [
        {
          name: "Standard Room",
          slug: "standard-room",
          description: "Cozy standard room suitable for 2 guests.",
          pricePerNight: 120,
          capacity: 2,
          bedType: "1 Queen Bed",
          imageUrl: null,
          totalUnits: 3
        },
        {
          name: "Family Room",
          slug: "family-room",
          description: "Spacious family room for up to 4 guests.",
          pricePerNight: 220,
          capacity: 4,
          bedType: "2 Queen Beds",
          imageUrl: null,
          totalUnits: 2
        },
        {
          name: "Farm Chalet",
          slug: "farm-chalet",
          description: "Private chalet with farm view.",
          pricePerNight: 300,
          capacity: 3,
          bedType: "1 King Bed",
          imageUrl: null,
          totalUnits: 1
        }
      ]
    });
  }

  const adminsCount = await prisma.adminUser.count();
  if (adminsCount === 0) {
    // password: admin123 (bcrypt hash)
    const hash = "$2a$10$RUt2G7CgnYVQf3B6P0GOBOHsezVVYt1URa5UAg6nJqR2F1QSGveQ6";
    await prisma.adminUser.createMany({
      data: [
        { email: "owner@walter-farm.com", name: "Owner", role: "OWNER", passwordHash: hash },
        { email: "manager@walter-farm.com", name: "Manager", role: "MANAGER", passwordHash: hash }
      ]
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
EOF

echo ">>> [prisma] 完成"
