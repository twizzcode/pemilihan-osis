"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { candidates } from "@/lib/db/schema";
import { deletePhoto, savePhoto } from "@/lib/storage";
import { MAX_CANDIDATE_NUMBER } from "@/lib/candidates";
import { getAdminSession } from "@/lib/auth";
import type { ActionState } from "./auth";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

function normalizeGender(value: FormDataEntryValue | null): "male" | "female" {
  return String(value) === "female" ? "female" : "male";
}

export async function createCandidate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  ensureDb();

  const eventId = Number(formData.get("eventId"));
  const number = Number(formData.get("number"));
  const chairName = String(formData.get("chairName") ?? "").trim();
  const gender = normalizeGender(formData.get("gender"));

  if (!eventId) return { error: "Pilih pemilihan terlebih dahulu." };
  if (!number || number < 1 || number > MAX_CANDIDATE_NUMBER) {
    return { error: `Nomor urut harus antara 1 sampai ${MAX_CANDIDATE_NUMBER}.` };
  }
  if (!chairName) return { error: "Nama ketua wajib diisi." };

  const duplicate = db
    .select()
    .from(candidates)
    .where(
      and(
        eq(candidates.eventId, eventId),
        eq(candidates.number, number),
        eq(candidates.gender, gender),
      ),
    )
    .get();
  if (duplicate) {
    return {
      error: `Nomor urut ${number} sudah dipakai pada kategori ${
        gender === "male" ? "Putra" : "Putri"
      }.`,
    };
  }

  let photoPath: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoPath = (await savePhoto(photo)).path;
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Gagal upload foto." };
    }
  }

  db.insert(candidates)
    .values({
      eventId,
      number,
      gender,
      chairName,
      viceName: String(formData.get("viceName") ?? "").trim() || null,
      className: String(formData.get("className") ?? "").trim() || null,
      photoPath,
      vision: String(formData.get("vision") ?? "").trim() || null,
      missions: String(formData.get("missions") ?? "").trim() || null,
      programs: String(formData.get("programs") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
    })
    .run();

  revalidatePath("/admin/candidates");
  revalidatePath("/admin");
  return { success: "Paslon berhasil ditambahkan." };
}

export async function updateCandidate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return { error: "ID tidak valid." };

  const current = db
    .select()
    .from(candidates)
    .where(eq(candidates.id, id))
    .get();
  if (!current) return { error: "Paslon tidak ditemukan." };

  const number = Number(formData.get("number"));
  const chairName = String(formData.get("chairName") ?? "").trim();
  const gender = normalizeGender(formData.get("gender"));
  if (!number || number < 1 || number > MAX_CANDIDATE_NUMBER) {
    return { error: `Nomor urut harus antara 1 sampai ${MAX_CANDIDATE_NUMBER}.` };
  }
  if (!chairName) return { error: "Nama ketua wajib diisi." };

  const duplicate = db
    .select()
    .from(candidates)
    .where(
      and(
        eq(candidates.eventId, current.eventId),
        eq(candidates.number, number),
        eq(candidates.gender, gender),
      ),
    )
    .get();
  if (duplicate && duplicate.id !== id) {
    return {
      error: `Nomor urut ${number} sudah dipakai pada kategori ${
        gender === "male" ? "Putra" : "Putri"
      }.`,
    };
  }

  let photoPath = current.photoPath;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      const uploaded = (await savePhoto(photo)).path;
      await deletePhoto(current.photoPath);
      photoPath = uploaded;
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Gagal upload foto." };
    }
  }

  db.update(candidates)
    .set({
      number,
      gender,
      chairName,
      viceName: String(formData.get("viceName") ?? "").trim() || null,
      className: String(formData.get("className") ?? "").trim() || null,
      photoPath,
      vision: String(formData.get("vision") ?? "").trim() || null,
      missions: String(formData.get("missions") ?? "").trim() || null,
      programs: String(formData.get("programs") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(candidates.id, id))
    .run();

  revalidatePath("/admin/candidates");
  revalidatePath("/admin");
  revalidatePath("/vote");
  return { success: "Data paslon berhasil diperbarui." };
}

export async function deleteCandidate(id: number) {
  await requireAdmin();
  const current = db
    .select()
    .from(candidates)
    .where(eq(candidates.id, id))
    .get();
  await deletePhoto(current?.photoPath);
  db.delete(candidates).where(eq(candidates.id, id)).run();
  revalidatePath("/admin/candidates");
  revalidatePath("/admin");
}
