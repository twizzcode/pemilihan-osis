import "server-only";

import { desc, eq } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { events, type Event } from "@/lib/db/schema";

/** Returns the single active event, regardless of schedule state. */
export function getActiveEvent(): Event | null {
  ensureDb();
  return (
    db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .orderBy(desc(events.createdAt))
      .limit(1)
      .get() ?? null
  );
}

export function getEventById(id: number): Event | null {
  ensureDb();
  return db.select().from(events).where(eq(events.id, id)).get() ?? null;
}

export function listEvents(): Event[] {
  ensureDb();
  return db.select().from(events).orderBy(desc(events.createdAt)).all();
}

export type EventPhase = "scheduled" | "open" | "closed";

/** Resolves whether an event is currently accepting votes. */
export function getEventPhase(event: Event, now = new Date()): EventPhase {
  if (event.mode === "open") return "open";
  if (event.mode === "closed") return "closed";
  if (event.startAt && now < event.startAt) return "scheduled";
  if (event.endAt && now > event.endAt) return "closed";
  return "open";
}

export function isVotingOpen(event: Event | null, now = new Date()) {
  if (!event) return false;
  return getEventPhase(event, now) === "open";
}

/** Deactivates all events except the given one. */
export function activateEvent(id: number) {
  db.update(events).set({ isActive: false }).run();
  db.update(events)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(events.id, id))
    .run();
}
