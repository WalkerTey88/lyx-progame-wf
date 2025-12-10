#!/usr/bin/env bash
set -e

ROOT="walter-farm-v2"

echo ">>> 初始化目录：$ROOT"
mkdir -p "$ROOT"

# 确保子脚本可执行（如果存在的话）
for f in generate-configs.sh generate-lib.sh generate-prisma.sh generate-types-and-components.sh generate-pages.sh generate-api.sh generate-docs.sh generate-admin.sh; do
  if [ -f "$f" ]; then
    chmod +x "$f"
  fi
done

echo ">>> 生成配置文件和基础结构..."
./generate-configs.sh

echo ">>> 生成 lib/ 核心库..."
./generate-lib.sh

echo ">>> 生成 Prisma schema + seed..."
./generate-prisma.sh

echo ">>> 生成 types/ + components/..."
./generate-types-and-components.sh

echo ">>> 生成前台页面 app/* ..."
./generate-pages.sh

echo ">>> 生成 API 路由 app/api/* ..."
./generate-api.sh

if [ -f "./generate-admin.sh" ]; then
  echo ">>> 调用已有 generate-admin.sh 生成 Admin TSX..."
  ./generate-admin.sh
else
  echo "!!! 警告：未找到 generate-admin.sh，Admin 前端未生成。"
fi

echo ">>> 生成 docs 文档..."
./generate-docs.sh

echo ">>> 全部生成完成：$ROOT"
