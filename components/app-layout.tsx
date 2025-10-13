"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MeshGradient } from "@paper-design/shaders-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { ModeToggle } from "./mode-toggle";
import { usePathname } from "next/navigation";

export function AppLayout({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen: boolean;
}) {
  const pathname = usePathname();

  /** @see `isSignInPage` in `proxy.ts` */
  const isSignInPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/reset-password";

  return (
    <>
      <Authenticated>
        <SidebarProvider
          className="[--header-height:calc(--spacing(12))]"
          defaultOpen={defaultOpen}
        >
          <AppSidebar collapsible="icon" />

          <SidebarInset className="min-w-0">
            <header className="bg-background sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <ModeToggle size="icon" variant="ghost" className="ml-auto" />
            </header>

            {children}
          </SidebarInset>
        </SidebarProvider>
      </Authenticated>

      <Unauthenticated>
        {isSignInPage ? (
          <div className="grid min-h-svh lg:grid-cols-2">
            {/* Left side with gradient background */}
            <div className="bg-muted relative hidden lg:block">
              <MeshGradient
                className="h-full"
                distortion={1}
                swirl={0}
                offsetX={0}
                offsetY={0}
                scale={1}
                rotation={0}
                speed={0.2}
                colors={[
                  "#fafafa",
                  "#f5f5f5",
                  "#e6e6e6",
                  "#d4d4d4",
                  "#a3a3a3",
                  "#737373",
                  "#525252",
                  "#404040",
                  "#262626",
                  "#171717",
                ]}
              />
            </div>

            {/* Right side with content */}
            {children}
          </div>
        ) : (
          children
        )}
      </Unauthenticated>
    </>
  );
}
