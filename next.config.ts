import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle in .next/standalone so it can be
  // rsync'd and run on the server with `bun server.js`. A normal `.next` is
  // still produced, so `next start` keeps working too.
  output: "standalone",
  // Keep file tracing scoped to this project (avoids scanning the home dir).
  outputFileTracingRoot: path.join(__dirname),
  // Native modules that must stay external on the server.
  serverExternalPackages: ["better-sqlite3", "sharp"],
  experimental: {
    // Allow photo uploads up to 5MB (default Server Action limit is 1MB).
    // Kept a bit above PHOTO_MAX_BYTES so the app-level check runs first.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
