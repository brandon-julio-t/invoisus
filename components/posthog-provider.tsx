"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import React, { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: "2025-05-24",
      capture_exceptions: true, // This enables capturing exceptions using Error Tracking
      debug: process.env.NODE_ENV === "development",
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <AutoIdentify />

      {children}
    </PHProvider>
  );
}

function AutoIdentify() {
  const [hasRun, setHasRun] = React.useState(false);
  const authUser = useQuery(api.auth.getAuthUser);
  const posthog = usePostHog();

  React.useEffect(() => {
    if (hasRun) return;

    if (authUser) {
      console.debug("Identify user start", authUser);

      posthog.identify(authUser._id, authUser);

      console.debug("Identify user end", authUser);

      setHasRun(true);
    }
  }, [authUser, hasRun, posthog]);

  return null;
}
