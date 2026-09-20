import { redirect } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/settings-form";
import { getAdminSession } from "@/lib/auth";

export const metadata = { title: "Pengaturan" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Kelola profil dan keamanan akun admin Anda."
      />
      <SettingsForm name={session.name} username={session.username} />
    </div>
  );
}
