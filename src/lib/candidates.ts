/**
 * Candidate (paslon) domain constants shared between server and client code.
 */

/** Maximum number of candidate pairs allowed per category (Putra/Putri). */
export const MAX_CANDIDATE_NUMBER = 5;

/** Selectable nomor urut options: 1..MAX_CANDIDATE_NUMBER. */
export const CANDIDATE_NUMBERS = Array.from(
  { length: MAX_CANDIDATE_NUMBER },
  (_, i) => i + 1,
);

export type CandidateGender = "male" | "female";

/** Display labels for candidate/voter categories. */
export const GENDER_LABELS: Record<CandidateGender, string> = {
  male: "Laki-laki",
  female: "Perempuan",
};

/** Ordered gender options for dropdowns. */
export const GENDER_OPTIONS: { value: CandidateGender; label: string }[] = [
  { value: "male", label: GENDER_LABELS.male },
  { value: "female", label: GENDER_LABELS.female },
];

/** Numbers taken per gender for an event, used to prevent duplicates in the UI. */
export type TakenNumbers = Record<CandidateGender, number[]>;
