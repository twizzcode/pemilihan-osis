import "server-only";

import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { candidates, voters, votes } from "@/lib/db/schema";

export function listCandidates(eventId: number, gender?: "male" | "female") {
  const conditions = gender
    ? and(eq(candidates.eventId, eventId), eq(candidates.gender, gender))
    : eq(candidates.eventId, eventId);
  return db
    .select()
    .from(candidates)
    .where(conditions)
    .orderBy(asc(candidates.gender), asc(candidates.number))
    .all();
}

export function getCandidate(id: number) {
  return db.select().from(candidates).where(eq(candidates.id, id)).get() ?? null;
}

export function listVoters(eventId: number) {
  return db
    .select()
    .from(voters)
    .where(eq(voters.eventId, eventId))
    .orderBy(asc(voters.className), asc(voters.fullName))
    .all();
}

export function getVoterByNis(eventId: number, nis: string) {
  return (
    db
      .select()
      .from(voters)
      .where(and(eq(voters.eventId, eventId), eq(voters.nis, nis.trim())))
      .get() ?? null
  );
}

export type TallyRow = {
  candidateId: number;
  number: number;
  gender: "male" | "female";
  chairName: string;
  viceName: string | null;
  photoPath: string | null;
  total: number;
};

/** Vote totals per candidate for an event. */
export function tallyVotes(eventId: number): TallyRow[] {
  const rows = db
    .select({
      candidateId: candidates.id,
      number: candidates.number,
      gender: candidates.gender,
      chairName: candidates.chairName,
      viceName: candidates.viceName,
      photoPath: candidates.photoPath,
      total: count(votes.id),
    })
    .from(candidates)
    .leftJoin(votes, eq(votes.candidateId, candidates.id))
    .where(eq(candidates.eventId, eventId))
    .groupBy(candidates.id)
    .orderBy(asc(candidates.gender), asc(candidates.number))
    .all();
  return rows as TallyRow[];
}

export type EventStats = {
  totalVoters: number;
  totalVoted: number;
  totalPending: number;
  maleVoters: number;
  maleVoted: number;
  femaleVoters: number;
  femaleVoted: number;
  totalBallots: number;
};

export function getEventStats(eventId: number): EventStats {
  const all = db
    .select({
      gender: voters.gender,
      hasVoted: voters.hasVoted,
    })
    .from(voters)
    .where(eq(voters.eventId, eventId))
    .all();

  const totalBallots =
    db
      .select({ value: count() })
      .from(votes)
      .where(eq(votes.eventId, eventId))
      .get()?.value ?? 0;

  const totalVoters = all.length;
  const maleVoters = all.filter((v) => v.gender === "male").length;
  const femaleVoters = all.filter((v) => v.gender === "female").length;
  const maleVoted = all.filter((v) => v.gender === "male" && v.hasVoted).length;
  const femaleVoted = all.filter(
    (v) => v.gender === "female" && v.hasVoted,
  ).length;
  const totalVoted = all.filter((v) => v.hasVoted).length;

  return {
    totalVoters,
    totalVoted,
    totalPending: totalVoters - totalVoted,
    maleVoters,
    maleVoted,
    femaleVoters,
    femaleVoted,
    totalBallots,
  };
}

export function listRecentVotes(eventId: number, limit = 10) {
  return db
    .select({
      voterName: voters.fullName,
      nis: voters.nis,
      className: voters.className,
      gender: voters.gender,
      votedAt: voters.votedAt,
      candidateNumber: candidates.number,
      candidateGender: candidates.gender,
      chairName: candidates.chairName,
    })
    .from(votes)
    .innerJoin(voters, eq(votes.voterId, voters.id))
    .innerJoin(candidates, eq(votes.candidateId, candidates.id))
    .where(eq(votes.eventId, eventId))
    .orderBy(desc(votes.createdAt))
    .limit(limit)
    .all();
}
