"use client";

import { authClient } from "@/lib/auth-client";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  verbose: process.env.NODE_ENV === "development",
});

export default function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: ReactNode;
  initialToken?: string | null;
}) {
  return (
    <ProgressProvider
      height="2px"
      color="var(--primary)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      <ConvexBetterAuthProvider
        client={convex}
        authClient={authClient}
        initialToken={initialToken}
      >
        <ConvexQueryCacheProvider>{children}</ConvexQueryCacheProvider>
      </ConvexBetterAuthProvider>
    </ProgressProvider>
  );
}
