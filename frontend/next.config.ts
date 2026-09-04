import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://kanban-task-management-c0ki.onrender.com"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

const nextConfig: NextConfig = {
  // Allow images from external sources if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
