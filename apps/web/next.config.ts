import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  experimental: {
    // Keep defaults; avoid risky flags early.
  },
};

export default nextConfig;
