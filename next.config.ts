import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/analyze",
        destination: "http://127.0.0.1:8001/analyze",
      },
    ];
  },
};

export default nextConfig;
