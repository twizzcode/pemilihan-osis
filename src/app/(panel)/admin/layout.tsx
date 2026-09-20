import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAdminSession } from "@/lib/auth";
import { ensureDb } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  ensureDb();
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        user={{ name: session.name, username: session.username }}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
