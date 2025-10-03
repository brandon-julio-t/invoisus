import { WorkflowManager } from "@convex-dev/workflow";
import z from "zod";
import { components } from "./_generated/api";

export const convexEnv = z
  .object({
    // convex auth
    JWKS: z.string(),
    JWT_PRIVATE_KEY: z.string(),
    SITE_URL: z.string(),

    // AI
    OPENROUTER_API_KEY: z.string(),
    OPENAI_API_KEY: z.string(),

    POSTHOG_API_KEY: z.string(),

    // Cloudflare R2
    R2_ACCESS_KEY_ID: z.string(),
    R2_BUCKET: z.string(),
    R2_ENDPOINT: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    R2_TOKEN: z.string(),
  })
  .parse(process.env);

export const workflow = new WorkflowManager(components.workflow, {
  workpoolOptions: {
    retryActionsByDefault: true,
    maxParallelism: 15, // pay-as-you-go plan max is 16, so we set 15 for now. can up this number when we upgrade our plan.
  },
});
