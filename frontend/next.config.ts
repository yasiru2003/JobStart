import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/files/:path*',
        destination: 'http://178.104.127.220:3000/api/files/:path*',
      },
    ];
  },
};

export default nextConfig;
