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
];
