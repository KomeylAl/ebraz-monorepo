import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "node:path";

loadEnvConfig(path.join(__dirname, "../.."));

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@ebraz/bff", "@ebraz/config"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
