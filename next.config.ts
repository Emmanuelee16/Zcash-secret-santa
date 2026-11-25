import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: ["three"] },
};

nextConfig.turbopack = { root: __dirname };

export default nextConfig;
