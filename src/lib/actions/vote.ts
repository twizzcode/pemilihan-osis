"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { candidates, voters, votes } from "@/lib/db/schema";
import { getActiveEvent, getEventPhase } from "@/lib/events";
import {
  clearVoterSession,
  getVoterSession,
  setVoterSession,
} from "@/lib/auth";
import type { ActionState } from "./auth";

export async function loginVoter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  ensureDb();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const nis = String(formData.get("nis") ?? "").trim();

  if (!fullName || !nis) {
    return { error: "Nama lengkap dan NIS wajib diisi." };
  }

  // The name is only validated for format; it no longer needs to match the
  // registered name. Authentication is based solely on the NIS.
  if (fullName.length < 3 || !/[a-zA-Z\u00C0-\u024F]/.test(fullName)) {
    return { error: "Nama lengkap tidak valid. Isi minimal 3 karakter huruf." };
  }

  const event = getActiveEvent();
  if (!event) {
    return { error: "Belum ada pemilihan yang dibuka saat ini." };
  }
  if (getEventPhase(event) !== "open") {
    return { error: "Pemilihan sedang tidak dibuka." };
  }

  const voter = db
    .select()
    .from(voters)
    .where(and(eq(voters.eventId, event.id), eq(voters.nis, nis)))
    .get();

  if (!voter) {
    return {
      error: "NIS tidak terdaftar sebagai pemilih pada pemilihan ini.",
    };
  }

  if (voter.hasVoted) {
    return {
      error: "NIS ini sudah menggunakan hak pilihnya. Terima kasih!",
    };
  }

  const hasCandidates = db
    .select()
    .from(candidates)
    .where(eq(candidates.eventId, event.id))
    .all()
    .some((c) => c.gender === voter.gender);
  if (!hasCandidates) {
    return {
      error: `Belum ada paslon ${
        voter.gender === "male" ? "Putra" : "Putri"
      } pada pemilihan ini.`,
    };
  }

  await setVoterSession({
    voterId: voter.id,
    eventId: event.id,
    nis: voter.nis,
    fullName: voter.fullName,
    gender: voter.gender,
  });

  redirect("/vote");
}

export async function logoutVoter() {
  await clearVoterSession();
  redirect("/");
}

/**
 * Submits a vote atomically. The voter row is marked hasVoted inside the same
 * transaction, guaranteeing one NIS = one vote even under concurrency.
 */
export async function submitVote(candidateId: number): Promise<ActionState> {
  ensureDb();
  const session = await getVoterSession();
  if (!session) return { error: "Sesi berakhir. Silakan login kembali." };

  const event = getActiveEvent();
  if (!event || event.id !== session.eventId) {
    return { error: "Pemilihan tidak lagi aktif." };
  }
  if (getEventPhase(event) !== "open") {
    return { error: "Pemilihan sudah ditutup." };
  }

  const candidate = db
    .select()
    .from(candidates)
    .where(eq(candidates.id, candidateId))
    .get();
  if (!candidate || candidate.eventId !== event.id) {
    return { error: "Paslon tidak valid." };
  }
  if (candidate.gender !== session.gender) {
    return { error: "Paslon tidak sesuai kategori Anda." };
  }

  try {
    db.transaction((tx) => {
      const voter = tx
        .select()
        .from(voters)
        .where(eq(voters.id, session.voterId))
        .get();

      if (!voter) throw new Error("missing");
      if (voter.hasVoted) throw new Error("Sudah memilih.");

      // Conditional update guards against double submission races.
      const result = tx
        .update(voters)
        .set({ hasVoted: true, votedAt: new Date() })
        .where(and(eq(voters.id, voter.id), eq(voters.hasVoted, false)))
        .run();

      if (result.changes === 0) throw new Error("Sudah memilih.");

      tx.insert(votes)
        .values({
          eventId: event.id,
          voterId: voter.id,
          candidateId: candidate.id,
        })
        .run();
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "Sudah memilih.") {
      return { error: "Anda sudah menggunakan hak pilih sebelumnya." };
    }
    return { error: "Terjadi kesalahan saat menyimpan suara." };
  }

  await clearVoterSession();
  redirect("/vote/thanks");
}
