"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Authenticated, Unauthenticated } from "convex/react";
import { ModeToggle } from "./mode-toggle";

export function AppLayout({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen: boolean;
}) {
  return (
    <>
      <Authenticated>
        <SidebarProvider
          className="[--header-height:calc(--spacing(12))]"
          defaultOpen={defaultOpen}
        >
          <AppSidebar collapsible="icon" />

          <SidebarInset>
            <header className="bg-background sticky top-0 flex h-(--header-height) shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <ModeToggle size="icon" variant="ghost" className="ml-auto" />
            </header>

            {children}
          </SidebarInset>
        </SidebarProvider>
      </Authenticated>

      <Unauthenticated>{children}</Unauthenticated>
    </>
  );
}
