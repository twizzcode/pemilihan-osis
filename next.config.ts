import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Produce a self-contained server bundle in .next/standalone for Docker.
  output: "standalone",
  // Keep file tracing scoped to this project (avoids scanning the home dir).
  outputFileTracingRoot: path.join(__dirname),
  // Native modules that must stay external on the server.
  serverExternalPackages: ["better-sqlite3", "sharp"],
};

export default nextConfig;
