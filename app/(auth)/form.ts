import type { ModelPreset } from "@/convex/domains/analyzeInvoice/aiModelFactory";
import { z } from "zod";

export const fileUploadSchema = z.object({
  files: z
    .array(
      z.object({
        rawFile: z.instanceof(File),
        status: z.enum(["pending", "uploading", "success", "error"]),
      }),
    )
    .nonempty(),
  pdfAnalysisModelPreset: z.string<ModelPreset>(),
  dataExtractionModelPreset: z.string<ModelPreset>(),
  version: z.union([z.literal("v1"), z.literal("v2")]).optional(),
});

export type FileUploadForm = z.infer<typeof fileUploadSchema>;
