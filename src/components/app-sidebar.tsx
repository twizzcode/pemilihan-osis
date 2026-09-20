"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  LayoutDashboard,
  ListOrdered,
  Settings,
  Trophy,
  Users,
  Vote,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Pemilihan", url: "/admin/events", icon: CalendarRange },
  { title: "Paslon", url: "/admin/candidates", icon: Trophy },
  { title: "Data Pemilih", url: "/admin/voters", icon: Users },
  { title: "Hasil & Rekap", url: "/admin/results", icon: ListOrdered },
  { title: "Pengaturan", url: "/admin/settings", icon: Settings },
];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; username: string };
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link href="/admin">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Vote className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Pilkasis</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Portal Admin
                    </span>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = item.exact
                  ? pathname === item.url
                  : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
