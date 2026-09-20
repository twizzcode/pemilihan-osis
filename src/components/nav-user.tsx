"use client";

import Link from "next/link";
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logoutAdmin } from "@/lib/actions/auth";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    username: string;
  };
}) {
  const { isMobile } = useSidebar();
  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                @{user.username}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/admin/settings" />}>
                <UserIcon />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/admin/settings" />}>
                <SettingsIcon />
                Pengaturan
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <form action={logoutAdmin}>
              <DropdownMenuItem
                variant="destructive"
                render={<button type="submit" className="w-full" />}
              >
                <LogOutIcon />
                Keluar
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
