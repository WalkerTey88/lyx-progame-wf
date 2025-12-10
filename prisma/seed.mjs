// prisma/seed.mjs
import { PrismaClient, UserRole, BookingStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// 使用和应用相同的 adapter（PostgreSQL）
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding started...');

  // 1) 管理员账号
  const admin = await prisma.user.upsert({
    where: { email: 'admin@walterfarm.local' },
    update: {},
    create: {
      email: 'admin@walterfarm.local',
      name: 'Walter Farm Admin',
      password: 'admin123456789', // TODO：后续可替换为加密后的密码
      role: UserRole.ADMIN,
    },
  });

  // 2) 房型
  const standard = await prisma.roomType.create({
    data: {
      name: 'Standard Room',
      description: 'Standard room for 2 pax',
      basePrice: 150,
      capacity: 2,
      images: [],
    },
  });

  const family = await prisma.roomType.create({
    data: {
      name: 'Family Room',
      description: 'Family room for 4 pax',
      basePrice: 260,
      capacity: 4,
      images: [],
    },
  });

  // 3) 具体房间
  await prisma.room.createMany({
    data: [
      { roomTypeId: standard.id, roomNumber: '101' },
      { roomTypeId: standard.id, roomNumber: '102' },
      { roomTypeId: family.id,  roomNumber: '201' },
    ],
    skipDuplicates: true,
  });

  console.log('Seeding finished. Admin id:', admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
