// Copies the assets that Next.js does NOT include in the standalone output
// into `.next/standalone`, so the whole bundle can be rsync'd as-is.
//
// Run automatically via `bun run build:standalone`.
//
// Next.js standalone already contains: server.js, .next/server, and the
// traced node_modules. We add: public/, .next/static, and drizzle/ (used at
// runtime by ensureDb() for migrations).

import { cp, mkdir, rm, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.error(
    "✗ .next/standalone not found. Did you run `next build` with output: 'standalone'?",
  );
  process.exit(1);
}

/** Recursively copy src → dest, replacing dest entirely. */
async function copy(src, dest) {
  if (!existsSync(src)) {
    console.warn(`• skip (missing): ${path.relative(root, src)}`);
    return;
  }
  await rm(dest, { recursive: true, force: true });
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(src, dest, { recursive: true });
  console.log(`✓ ${path.relative(root, src)} → ${path.relative(root, dest)}`);
}

await copy(path.join(root, "public"), path.join(standalone, "public"));
await copy(
  path.join(root, ".next", "static"),
  path.join(standalone, ".next", "static"),
);
await copy(path.join(root, "drizzle"), path.join(standalone, "drizzle"));

// Remove anything Next.js may have traced from local runtime data so it never
// overwrites the server's database/uploads on rsync.
for (const junk of ["data.db", "data.db-shm", "data.db-wal", "storage"]) {
  await rm(path.join(standalone, junk), { recursive: true, force: true });
}

// Ensure a runtime entrypoint exists.
await access(path.join(standalone, "server.js")).catch(() => {
  console.error("✗ server.js missing from standalone output.");
  process.exit(1);
});

console.log("\nStandalone bundle ready in .next/standalone/");
