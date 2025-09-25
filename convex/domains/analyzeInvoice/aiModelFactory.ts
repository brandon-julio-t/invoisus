"use node";

import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { withTracing } from "@posthog/ai";
import { createPosthogClient } from "../../libs/posthog";

type BaseModel = "gpt-5";

type ReasoningEffort = "minimal" | "low" | "medium" | "high";

export type ModelPreset =
  | `${BaseModel}-${ReasoningEffort}`
  | `${BaseModel}-mini-${ReasoningEffort}`
  | `${BaseModel}-nano-${ReasoningEffort}`;

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
  }
}
