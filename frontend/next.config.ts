import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables standalone output for optimized Docker production builds.
  // This produces a minimal .next/standalone folder with only necessary files.
  output: "standalone",
};

export default nextConfig;
