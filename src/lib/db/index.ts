import "server-only";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

import * as schema from "./schema";
import { admins } from "./schema";

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data.db");

const sqlite = new Database(DB_PATH);

// Performance & concurrency tuning for a shared read-heavy workload.
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

let initialized = false;

/**
 * Runs migrations and seeds the default admin once per process. Called from
 * server entry points so cold starts self-heal.
 */
export function ensureDb() {
  if (initialized) return;

  const migrationsFolder = path.join(process.cwd(), "drizzle");
  if (existsSync(migrationsFolder)) {
    migrate(db, { migrationsFolder });
  }

  const existing = db.select().from(admins).limit(1).all();
  if (existing.length === 0) {
    db.insert(admins)
      .values({
        username: "admin",
        passwordHash: bcrypt.hashSync("admin123", 10),
        name: "Administrator",
      })
      .run();
  }

  initialized = true;
}

/**
 * Returns true when any admin account still uses the seeded default password.
 * Used to show the "default credentials" hint only until it has been changed.
 */
export function isUsingDefaultPassword() {
  const existing = db.select().from(admins).all();
  return existing.some((admin) => bcrypt.compareSync("admin123", admin.passwordHash));
}

/** Ensures the upload directory exists and returns its absolute path. */
export function ensureStorageDir() {
  const dir = process.env.STORAGE_DIR ?? path.join(process.cwd(), "storage");
  const uploads = path.join(dir, "uploads");
  if (!existsSync(uploads)) mkdirSync(uploads, { recursive: true });
  return uploads;
}
