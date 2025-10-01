import { ModelPreset } from "@/convex/domains/analyzeInvoice/aiModelFactory";
import { z } from "zod";

export const fileUploadSchema = z.object({
  files: z
    .array(
      z.object({
        rawFile: z.instanceof(File),
        status: z.enum(["pending", "uploading", "success", "error"]),
      }),
    )
    .min(1),
  modelPreset: z.string<ModelPreset>(),
  benchmark: z.boolean(),
});

export type FileUploadForm = z.infer<typeof fileUploadSchema>;

export const allModelPresets: ModelPreset[] = [
  "gpt-5-minimal",
  "gpt-5-low",
  "gpt-5-medium",
  "gpt-5-high",

  "gpt-5-mini-minimal",
  "gpt-5-mini-low",
  "gpt-5-mini-medium",
  "gpt-5-mini-high",

  "gpt-5-nano-minimal",
  "gpt-5-nano-low",
  "gpt-5-nano-medium",
  "gpt-5-nano-high",

  "o3",
  "o3-deep-research",
  "o3-mini",
  "o3-pro",
  "o4-mini",
  "o4-deep-research",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "o1-pro",
  "gpt-4o",
  "gpt-4o-mini",
];
