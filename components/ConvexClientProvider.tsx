"use client";

import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProgressProvider
      height="2px"
      color="var(--primary)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      <ConvexAuthNextjsProvider client={convex}>
        <ConvexQueryCacheProvider>{children}</ConvexQueryCacheProvider>
      </ConvexAuthNextjsProvider>
    </ProgressProvider>
  );
}
