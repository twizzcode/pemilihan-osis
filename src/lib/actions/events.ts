"use server";

import { revalidatePath } from "next/cache";
import { eq, ne } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { activateEvent } from "@/lib/events";
import { getAdminSession } from "@/lib/auth";
import type { ActionState } from "./auth";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

function parseDate(value: FormDataEntryValue | null): Date | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  ensureDb();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nama pemilihan wajib diisi." };

  const startAt = parseDate(formData.get("startAt"));
  const endAt = parseDate(formData.get("endAt"));
  if (startAt && endAt && endAt < startAt) {
    return { error: "Waktu selesai tidak boleh sebelum waktu mulai." };
  }

  const [created] = db
    .insert(events)
    .values({
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      startAt,
      endAt,
      mode: "auto",
    })
    .returning()
    .all();

  // First ever event becomes active automatically.
  const total = db.select().from(events).all().length;
  if (total === 1 && created) activateEvent(created.id);

  revalidatePath("/admin/events");
  revalidatePath("/admin");
  return { success: "Pemilihan berhasil dibuat." };
}

export async function updateEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return { error: "ID tidak valid." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nama pemilihan wajib diisi." };

  const startAt = parseDate(formData.get("startAt"));
  const endAt = parseDate(formData.get("endAt"));
  if (startAt && endAt && endAt < startAt) {
    return { error: "Waktu selesai tidak boleh sebelum waktu mulai." };
  }

  const mode = String(formData.get("mode") ?? "auto");
  db.update(events)
    .set({
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      startAt,
      endAt,
      mode: mode === "open" || mode === "closed" ? mode : "auto",
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .run();

  revalidatePath("/admin/events");
  revalidatePath("/admin");
  return { success: "Pemilihan berhasil diperbarui." };
}

export async function setActiveEvent(id: number) {
  await requireAdmin();
  activateEvent(id);
  revalidatePath("/admin/events");
  revalidatePath("/admin");
  revalidatePath("/vote");
}

export async function deleteEvent(id: number) {
  await requireAdmin();
  const target = db.select().from(events).where(eq(events.id, id)).get();
  db.delete(events).where(eq(events.id, id)).run();

  if (target?.isActive) {
    const remaining = db
      .select()
      .from(events)
      .where(ne(events.id, id))
      .all();
    if (remaining.length > 0) activateEvent(remaining[0].id);
  }
  revalidatePath("/admin/events");
  revalidatePath("/admin");
}
