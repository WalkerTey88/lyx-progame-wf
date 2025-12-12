#!/usr/bin/env bash
set -e

ROOT="walter-farm-v2"

echo ">>> [configs] 生成 package.json / tsconfig / next / tailwind / postcss / env..."

mkdir -p "$ROOT"
mkdir -p "$ROOT/app"
mkdir -p "$ROOT/public"

########################################
# package.json
########################################
cat <<'EOF' > "$ROOT/package.json"
{
  "name": "walter-farm-v2",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:seed": "prisma db seed",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^5.20.0",
    "@vercel/blob": "^0.25.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.9.0",
    "next": "14.2.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "resend": "^3.4.0",
    "stripe": "^16.0.0",
    "swr": "^2.2.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/node": "^22.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.2.5",
    "postcss": "^8.4.0",
    "prisma": "^5.20.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0",
    "vitest": "^2.1.0"
  },
  "prisma": {
    "seed": "node prisma/seed.mjs"
  }
}
EOF

########################################
# tsconfig.json
########################################
cat <<'EOF' > "$ROOT/tsconfig.json"
{
  "compilerOptions": {
    "target": "ES6",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "paths": {
      "@/*": ["./*"]
    },
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "tests/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

########################################
# next-env.d.ts
########################################
cat <<'EOF' > "$ROOT/next-env.d.ts"
/// <reference types="next" />
/// <reference types="next/image-types/global" />
EOF

########################################
# next.config.mjs
########################################
cat <<'EOF' > "$ROOT/next.config.mjs"
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  }
};

export default nextConfig;
EOF

########################################
# tailwind.config.ts
########################################
cat <<'EOF' > "$ROOT/tailwind.config.ts"
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
EOF

########################################
# postcss.config.mjs
########################################
cat <<'EOF' > "$ROOT/postcss.config.mjs"
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
EOF

########################################
# app/globals.css
########################################
mkdir -p "$ROOT/app"
cat <<'EOF' > "$ROOT/app/globals.css"
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-slate-50 text-slate-900;
}

main {
  @apply max-w-6xl mx-auto px-4 py-6;
}
EOF

########################################
# vitest.config.ts
########################################
cat <<'EOF' > "$ROOT/vitest.config.ts"
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});
EOF

########################################
# .env.example
########################################
cat <<'EOF' > "$ROOT/.env.example"
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

ADMIN_JWT_SECRET="change-this-to-a-long-random-secret"

STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

NEXT_PUBLIC_BASE_URL="http://localhost:3000"

RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="booking@walter-farm.com"

BLOB_READ_WRITE_TOKEN="vercel_blob_token"
EOF

echo ">>> [configs] 完成"
