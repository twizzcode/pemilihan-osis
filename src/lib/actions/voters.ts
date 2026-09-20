"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { voters } from "@/lib/db/schema";
import { getAdminSession } from "@/lib/auth";
import type { ActionState } from "./auth";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

function normalizeGender(value: FormDataEntryValue | null | string):
  | "male"
  | "female" {
  const v = String(value ?? "").trim().toLowerCase();
  if (["perempuan", "putri", "p", "female", "f", "wanita"].includes(v)) {
    return "female";
  }
  return "male";
}

export async function createVoter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  ensureDb();

  const eventId = Number(formData.get("eventId"));
  const nis = String(formData.get("nis") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const className = String(formData.get("className") ?? "").trim() || null;
  const gender = normalizeGender(formData.get("gender"));

  if (!eventId) return { error: "Pilih pemilihan terlebih dahulu." };
  if (!nis) return { error: "NIS wajib diisi." };
  if (!fullName) return { error: "Nama lengkap wajib diisi." };

  const duplicate = db
    .select()
    .from(voters)
    .where(and(eq(voters.eventId, eventId), eq(voters.nis, nis)))
    .get();
  if (duplicate) return { error: `NIS ${nis} sudah terdaftar.` };

  db.insert(voters)
    .values({ eventId, nis, fullName, className, gender })
    .run();

  revalidatePath("/admin/voters");
  revalidatePath("/admin");
  return { success: "Pemilih berhasil ditambahkan." };
}

export async function updateVoter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return { error: "ID tidak valid." };

  const current = db.select().from(voters).where(eq(voters.id, id)).get();
  if (!current) return { error: "Pemilih tidak ditemukan." };

  const nis = String(formData.get("nis") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!nis) return { error: "NIS wajib diisi." };
  if (!fullName) return { error: "Nama lengkap wajib diisi." };

  const duplicate = db
    .select()
    .from(voters)
    .where(and(eq(voters.eventId, current.eventId), eq(voters.nis, nis)))
    .get();
  if (duplicate && duplicate.id !== id) {
    return { error: `NIS ${nis} sudah dipakai pemilih lain.` };
  }

  db.update(voters)
    .set({
      nis,
      fullName,
      className: String(formData.get("className") ?? "").trim() || null,
      gender: normalizeGender(formData.get("gender")),
    })
    .where(eq(voters.id, id))
    .run();

  revalidatePath("/admin/voters");
  return { success: "Data pemilih berhasil diperbarui." };
}

export async function deleteVoter(id: number) {
  await requireAdmin();
  db.delete(voters).where(eq(voters.id, id)).run();
  revalidatePath("/admin/voters");
  revalidatePath("/admin");
}

export async function deleteVoters(ids: number[]) {
  await requireAdmin();
  const unique = [...new Set(ids)].filter((id) => Number.isInteger(id));
  if (unique.length === 0) return;

  db.delete(voters).where(inArray(voters.id, unique)).run();
  revalidatePath("/admin/voters");
  revalidatePath("/admin");
}

export async function resetVoterVote(id: number) {
  await requireAdmin();
  db.update(voters)
    .set({ hasVoted: false, votedAt: null })
    .where(eq(voters.id, id))
    .run();
  revalidatePath("/admin/voters");
  revalidatePath("/admin");
}

export type ImportResult = ActionState & {
  inserted?: number;
  skipped?: number;
};

/**
 * Bulk import voters from pasted CSV/TSV text.
 * Expected columns: nis, nama, kelas, gender (header optional).
 */
export async function importVotersCsv(
  _prev: ImportResult,
  formData: FormData,
): Promise<ImportResult> {
  await requireAdmin();
  ensureDb();

  const eventId = Number(formData.get("eventId"));
  if (!eventId) return { error: "Pilih pemilihan terlebih dahulu." };

  const raw = String(formData.get("csv") ?? "").trim();
  if (!raw) return { error: "Data CSV kosong." };

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const [index, line] of lines.entries()) {
    const cols = line.split(/[;,\t]/).map((c) => c.trim().replace(/^"|"$/g, ""));
    const [nis, fullName, className, gender] = cols;

    if (
      index === 0 &&
      /nis/i.test(nis ?? "") &&
      /nama/i.test(fullName ?? "")
    ) {
      continue; // header row
    }

    if (!nis || !fullName) {
      skipped++;
      continue;
    }

    const existing = db
      .select()
      .from(voters)
      .where(and(eq(voters.eventId, eventId), eq(voters.nis, nis)))
      .get();
    if (existing) {
      skipped++;
      continue;
    }

    try {
      db.insert(voters)
        .values({
          eventId,
          nis,
          fullName,
          className: className || null,
          gender: normalizeGender(gender),
        })
        .run();
      inserted++;
    } catch {
      errors.push(nis);
      skipped++;
    }
  }

  revalidatePath("/admin/voters");
  revalidatePath("/admin");
  return {
    success: `Import selesai: ${inserted} ditambahkan, ${skipped} dilewati.`,
    inserted,
    skipped,
  };
}
