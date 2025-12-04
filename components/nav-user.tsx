"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { useRouter } from "@bprogress/next";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { usePostHog } from "posthog-js/react";
import React from "react";
import { toast } from "sonner";

export function NavUser() {
  const { isMobile } = useSidebar();

  const user = useQuery(api.auth.getAuthUser);
  const initials = user?.email?.slice(0, 2).toUpperCase() || "CN";

  const posthog = usePostHog();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [isSigningOut, startSigningOut] = React.useTransition();
  const onSignOut = async () => {
    startSigningOut(async () => {
      await toast
        .promise(signOut(), {
          loading: "Signing out...",
          success: "Signed out successfully",
          error: "Failed to sign out",
        })
        .unwrap();

      posthog.reset();

      router.push("/login");
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {user === undefined ? (
          <SidebarMenuSkeleton />
        ) : user === null ? null : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={"user.avatar"} alt={user.name} />
                  <AvatarFallback className="from-primary/5 to-primary/10 rounded-lg bg-gradient-to-b">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={"user.avatar"} alt={user.name} />
                    <AvatarFallback className="from-primary/5 to-primary/10 rounded-lg bg-gradient-to-b">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onSignOut} disabled={isSigningOut}>
                {isSigningOut ? <Spinner /> : <LogOut />}
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
