"use node";

import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { withTracing } from "@posthog/ai";
import { createPosthogClient } from "../../libs/posthog";

type ReasoningEffort = "minimal" | "low" | "medium" | "high";

export type ModelPreset =
  | `gpt-5-${ReasoningEffort}`
  | `gpt-5-mini-${ReasoningEffort}`
  | `gpt-5-nano-${ReasoningEffort}`
  | "o3"
  | "o3-deep-research"
  | "o3-mini"
  | "o3-pro"
  | "o4-mini"
  | "o4-deep-research"
  | "gpt-4.1"
  | "gpt-4.1-mini"
  | "gpt-4.1-nano"
  | "o1-pro"
  | "gpt-4o"
  | "gpt-4o-mini";

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

  const { model, providerOptions } =
    makeModelAndProviderOptionsFromModelPreset(modelPreset);

  return {
    phClient,

    providerOptions,

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
    case "gpt-5-minimal":
      return {
        model: openai("gpt-5"),
        providerOptions: {
          openai: {
            reasoningEffort: "minimal",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };
    case "gpt-5-low":
      return {
        model: openai("gpt-5"),
        providerOptions: {
          openai: {
            reasoningEffort: "low",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };
    case "gpt-5-medium":
      return {
        model: openai("gpt-5"),
        providerOptions: {
          openai: {
            reasoningEffort: "medium",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };
    case "gpt-5-high":
      return {
        model: openai("gpt-5"),
        providerOptions: {
          openai: {
            reasoningEffort: "high",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };

    case "gpt-5-mini-minimal":
      return {
        model: openai("gpt-5-mini"),
        providerOptions: {
          openai: {
            reasoningEffort: "minimal",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };
    case "gpt-5-mini-low":
      return {
        model: openai("gpt-5-mini"),
        providerOptions: {
          openai: {
            reasoningEffort: "low",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };
    case "gpt-5-mini-medium":
      return {
        model: openai("gpt-5-mini"),
        providerOptions: {
          openai: {
            reasoningEffort: "medium",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };
    case "gpt-5-mini-high":
      return {
        model: openai("gpt-5-mini"),
        providerOptions: {
          openai: {
            reasoningEffort: "high",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };

    case "gpt-5-nano-minimal":
      return {
        model: openai("gpt-5-nano"),
        providerOptions: {
          openai: {
            reasoningEffort: "minimal",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };
    case "gpt-5-nano-low":
      return {
        model: openai("gpt-5-nano"),
        providerOptions: {
          openai: {
            reasoningEffort: "low",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };
    case "gpt-5-nano-medium":
      return {
        model: openai("gpt-5-nano"),
        providerOptions: {
          openai: {
            reasoningEffort: "medium",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };
    case "gpt-5-nano-high":
      return {
        model: openai("gpt-5-nano"),
        providerOptions: {
          openai: {
            reasoningEffort: "high",
          } satisfies OpenAIResponsesProviderOptions,
        },
      };

    case "o4-mini":
      return {
        model: openai("o4-mini"),
      };

    case "o4-deep-research":
      return {
        model: openai("o4-deep-research"),
      };

    case "o3":
      return {
        model: openai("o3"),
      };

    case "o3-deep-research":
      return {
        model: openai("o3-deep-research"),
      };

    case "o3-mini":
      return {
        model: openai("o3-mini"),
      };

    case "o3-pro":
      return {
        model: openai("o3-pro"),
      };

    case "gpt-4.1":
      return {
        model: openai("gpt-4.1"),
      };

    case "gpt-4.1-mini":
      return {
        model: openai("gpt-4.1-mini"),
      };

    case "gpt-4.1-nano":
      return {
        model: openai("gpt-4.1-nano"),
      };

    case "o1-pro":
      return {
        model: openai("o1-pro"),
      };

    case "gpt-4o":
      return {
        model: openai("gpt-4o"),
      };

    case "gpt-4o-mini":
      return {
        model: openai("gpt-4o-mini"),
      };

    default:
      throw new Error(`Unsupported model preset: ${modelPreset}`);
  }
}
