import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用 standalone 输出模式（用于 Docker 部署）
  output: "standalone",
  
  // 启用 React 编译器
  reactCompiler: true,
  
  // 配置允许的图片域名
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
