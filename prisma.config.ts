// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";
type Env = {
  DATABASE_URL: string;
};
export default defineConfig({
  // Prisma schema 文件路径
  schema: "prisma/schema.prisma",
  // 迁移文件目录（保持默认即可）
  migrations: {
    path: "prisma/migrations",
  },
  // 数据库连接字符串，从环境变量 DATABASE_URL 读取
  datasource: {
    url: env<Env>("DATABASE_URL"),
  },
});