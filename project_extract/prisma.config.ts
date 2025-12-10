// prisma.config.ts
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // 指向你的 Prisma schema
  schema: 'prisma/schema.prisma',

  // 迁移 & seed 配置
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.mjs', // prisma db seed 会执行这个
  },

  // Prisma 7: 连接字符串改在 config 里配置
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
