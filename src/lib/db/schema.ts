import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

/** Admin accounts for the management portal. */
export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default("Administrator"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/** A voting event, e.g. "PILKOSPAPI 2025". Only one is active at a time. */
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  startAt: integer("start_at", { mode: "timestamp" }),
  endAt: integer("end_at", { mode: "timestamp" }),
  /** "auto" respects the schedule, "open" forces open, "closed" forces closed. */
  mode: text("mode", { enum: ["auto", "open", "closed"] })
    .notNull()
    .default("auto"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/** Voters (students). NIS is the unique key used for validation. */
export const voters = sqliteTable(
  "voters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    nis: text("nis").notNull(),
    fullName: text("full_name").notNull(),
    className: text("class_name"),
    gender: text("gender", { enum: ["male", "female"] }).notNull(),
    hasVoted: integer("has_voted", { mode: "boolean" })
      .notNull()
      .default(false),
    votedAt: integer("voted_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("voters_event_nis_unique").on(table.eventId, table.nis),
  ],
);

/** Candidate pairs (paslon) for an event, separated by gender. */
export const candidates = sqliteTable(
  "candidates",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    gender: text("gender", { enum: ["male", "female"] }).notNull(),
    /** Chairperson name (ketua). */
    chairName: text("chair_name").notNull(),
    /** Running mate name (wakil), optional. */
    viceName: text("vice_name"),
    className: text("class_name"),
    photoPath: text("photo_path"),
    vision: text("vision"),
    missions: text("missions"),
    programs: text("programs"),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("candidates_event_number_gender_unique").on(
      table.eventId,
      table.number,
      table.gender,
    ),
    index("candidates_event_gender_idx").on(table.eventId, table.gender),
  ],
);

/** Recorded votes. One row per voter per event. */
export const votes = sqliteTable(
  "votes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    voterId: integer("voter_id")
      .notNull()
      .references(() => voters.id, { onDelete: "cascade" }),
    candidateId: integer("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("votes_voter_unique").on(table.voterId)],
);

export type Admin = typeof admins.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Voter = typeof voters.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type Vote = typeof votes.$inferSelect;
