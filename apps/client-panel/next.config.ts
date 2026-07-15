import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "node:path";

loadEnvConfig(path.join(__dirname, "../.."));

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
};

export default nextConfig;
