"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db, ensureDb } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import {
  clearAdminSession,
  getAdminSession,
  setAdminSession,
} from "@/lib/auth";

export type ActionState = { error?: string; success?: string };

export async function loginAdmin(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  ensureDb();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  const admin = db
    .select()
    .from(admins)
    .where(eq(admins.username, username))
    .get();

  if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
    return { error: "Username atau password salah." };
  }

  await setAdminSession({
    adminId: admin.id,
    username: admin.username,
    name: admin.name,
  });
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateAdminProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Sesi tidak valid." };

  const name = String(formData.get("name") ?? "").trim();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const admin = db
    .select()
    .from(admins)
    .where(eq(admins.id, session.adminId))
    .get();
  if (!admin) return { error: "Akun tidak ditemukan." };

  const updates: Partial<{ name: string; passwordHash: string }> = {};
  if (name) updates.name = name;

  if (currentPassword || newPassword || confirmPassword) {
    if (!bcrypt.compareSync(currentPassword, admin.passwordHash)) {
      return { error: "Password lama salah." };
    }
    if (newPassword.length < 6) {
      return { error: "Password baru minimal 6 karakter." };
    }
    if (newPassword !== confirmPassword) {
      return { error: "Konfirmasi password tidak cocok." };
    }
    updates.passwordHash = bcrypt.hashSync(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) {
    return { error: "Tidak ada perubahan." };
  }

  db.update(admins).set(updates).where(eq(admins.id, admin.id)).run();
  await setAdminSession({
    adminId: admin.id,
    username: admin.username,
    name: updates.name ?? admin.name,
  });
  return { success: "Pengaturan berhasil disimpan." };
}
