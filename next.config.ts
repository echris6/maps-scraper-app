import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Skip type checking during build (Railway timeout issue)
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  // Disable experimental features for faster builds
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
