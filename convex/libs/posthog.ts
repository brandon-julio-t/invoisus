"use node";

import { PostHog } from "posthog-node";

if (!process.env.POSTHOG_API_KEY) {
  throw new Error("POSTHOG_API_KEY is not set");
}

export const createPosthogClient = () => {
  return new PostHog(process.env.POSTHOG_API_KEY!, {
    host: "https://us.i.posthog.com",
  });
};
