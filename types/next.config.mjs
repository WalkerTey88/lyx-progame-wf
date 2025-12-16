/** @type {import('next').NextConfig} */
const nextConfig = {
  // 这里先保留最基础配置；后面如果你有别的需求（images、i18n 等），再往这个对象里加
  reactStrictMode: true,

  experimental: {
    serverActions: {
      /**
       * 允许哪些 Origin 调用 Server Actions
       * 注意：这里写的是 host[:port]，不要加 "http://"
       *
       * - "localhost:3000" / "127.0.0.1:3000"：你本机/SSH 直连开发
       * - "*.github.dev" / "*.app.github.dev"：GitHub Codespaces 这类域名
       *   （你的日志里就是 automatic-tribble-4j9r959vvpgjcq6v9-3000.app.github.dev）
       */
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "*.github.dev",
        "*.app.github.dev",
      ],
    },
  },
};

export default nextConfig;