import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET ?? "dev-insecure-secret-change-me";

export const ADMIN_COOKIE = "pilkospapi_admin";
export const VOTER_COOKIE = "pilkospapi_voter";

export type AdminSession = {
  adminId: number;
  username: string;
  name: string;
};

export type VoterSession = {
  voterId: number;
  eventId: number;
  nis: string;
  fullName: string;
  gender: "male" | "female";
};

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function encode(data: unknown) {
  const body = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function setAdminSession(session: AdminSession) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, encode(session), {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 12,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return decode<AdminSession>(store.get(ADMIN_COOKIE)?.value);
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function setVoterSession(session: VoterSession) {
  const store = await cookies();
  store.set(VOTER_COOKIE, encode(session), {
    ...COOKIE_OPTS,
    maxAge: 60 * 30,
  });
}

export async function getVoterSession(): Promise<VoterSession | null> {
  const store = await cookies();
  return decode<VoterSession>(store.get(VOTER_COOKIE)?.value);
}

export async function clearVoterSession() {
  const store = await cookies();
  store.delete(VOTER_COOKIE);
}
