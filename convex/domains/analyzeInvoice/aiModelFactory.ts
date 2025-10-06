"use node";

import { openrouter } from "@openrouter/ai-sdk-provider";
import { withTracing } from "@posthog/ai";
import { createPosthogClient } from "../../libs/posthog";

type ReasoningEffort = "minimal" | "low" | "medium" | "high";

export type ModelPreset =
  | "gemini-2.5-pro"
  | "gemini-2.5-flash"
  | "gemini-2.5-flash-lite"
  //
  | `gpt-5-${ReasoningEffort}`
  | `gpt-5-mini-${ReasoningEffort}`
  | `gpt-5-nano-${ReasoningEffort}`
  //
  | "o3-pro"
  | "o3"
  | "o3-mini-high"
  | "o3-mini"
  //
  | "o4-mini-high"
  | "o4-mini"
  //
  | "gpt-4.1"
  | "gpt-4.1-mini"
  | "gpt-4.1-nano";

export function createModel({
  modelPreset,
  userId,
  traceId,
  metadata,
}: {
  modelPreset: ModelPreset;
  userId: string | undefined;
  traceId: string | undefined;
  metadata: Record<string, string | number> & {
    functionName: string;
  };
}) {
  const phClient = createPosthogClient();

  const { model } = makeModelAndProviderOptionsFromModelPreset(modelPreset);

  return {
    phClient,

    model: withTracing(model, phClient, {
      posthogDistinctId: userId,
      posthogTraceId: traceId,
      posthogProperties: metadata,
      posthogGroups: metadata,
    }),
  };
}

function makeModelAndProviderOptionsFromModelPreset(modelPreset: ModelPreset) {
  switch (modelPreset) {
    case "gemini-2.5-pro":
      return {
        model: openrouter("google/gemini-2.5-pro"),
      };
    case "gemini-2.5-flash":
      return {
        model: openrouter("google/gemini-2.5-flash"),
      };
    case "gemini-2.5-flash-lite":
      return {
        model: openrouter("google/gemini-2.5-flash-lite"),
      };

    case "gpt-5-minimal":
      return {
        model: openrouter("openai/gpt-5"),
      };
    case "gpt-5-low":
      return {
        model: openrouter("openai/gpt-5"),
      };
    case "gpt-5-medium":
      return {
        model: openrouter("openai/gpt-5"),
      };
    case "gpt-5-high":
      return {
        model: openrouter("openai/gpt-5"),
      };

    case "gpt-5-mini-minimal":
      return {
        model: openrouter("openai/gpt-5-mini"),
      };
    case "gpt-5-mini-low":
      return {
        model: openrouter("openai/gpt-5-mini"),
      };
    case "gpt-5-mini-medium":
      return {
        model: openrouter("openai/gpt-5-mini"),
      };
    case "gpt-5-mini-high":
      return {
        model: openrouter("openai/gpt-5-mini"),
      };

    case "gpt-5-nano-minimal":
      return {
        model: openrouter("openai/gpt-5-nano"),
      };
    case "gpt-5-nano-low":
      return {
        model: openrouter("openai/gpt-5-nano"),
      };
    case "gpt-5-nano-medium":
      return {
        model: openrouter("openai/gpt-5-nano"),
      };
    case "gpt-5-nano-high":
      return {
        model: openrouter("openai/gpt-5-nano"),
      };

    case "o4-mini":
      return {
        model: openrouter("openai/o4-mini"),
      };

    case "o4-mini-high":
      return {
        model: openrouter("openai/o4-mini-high"),
      };

    case "o3-pro":
      return {
        model: openrouter("openai/o3-pro"),
      };

    case "o3":
      return {
        model: openrouter("openai/o3"),
      };

    case "o3-mini":
      return {
        model: openrouter("openai/o3-mini"),
      };

    case "o3-mini-high":
      return {
        model: openrouter("openai/o3-mini-high"),
      };

    case "gpt-4.1":
      return {
        model: openrouter("openai/gpt-4.1"),
      };

    case "gpt-4.1-mini":
      return {
        model: openrouter("openai/gpt-4.1-mini"),
      };

    case "gpt-4.1-nano":
      return {
        model: openrouter("openai/gpt-4.1-nano"),
      };

    default:
      throw new Error(`Unsupported model preset: ${modelPreset}`);
  }
}
