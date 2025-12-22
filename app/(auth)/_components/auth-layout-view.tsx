"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Redirect } from "@/components/redirect";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { XOctagonIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export function AuthLayoutView({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen: boolean;
}) {
  return (
    <>
      <AuthLoading>
        <div className="container grid min-h-svh place-items-center">
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Spinner />
              </EmptyMedia>
              <EmptyTitle>Loading...</EmptyTitle>
              <EmptyDescription>
                Please wait while we load the page...
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </AuthLoading>

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
        <div className="container grid min-h-svh place-items-center">
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia>
                <XOctagonIcon />
              </EmptyMedia>
              <EmptyTitle>Unauthenticated</EmptyTitle>
              <EmptyDescription>
                You are not authenticated. Please login to continue.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>

        <Redirect href="/login" />
      </Unauthenticated>
    </>
  );
}
