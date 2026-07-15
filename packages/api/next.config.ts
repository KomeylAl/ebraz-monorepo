import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@ebraz/auth",
    "@ebraz/config",
    "@ebraz/database",
    "@ebraz/types",
    "@ebraz/utils",
    "@ebraz/validation",
  ],
};

export default nextConfig;
