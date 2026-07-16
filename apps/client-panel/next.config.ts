import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "node:path";

loadEnvConfig(path.join(__dirname, "../.."));

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@ebraz/api-client",
    "@ebraz/auth",
    "@ebraz/bff",
    "@ebraz/config",
    "@ebraz/types",
    "@ebraz/ui",
    "@ebraz/web",
  ],
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiBaseUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
