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
  pdfAnalysisModelPreset: z.string<ModelPreset>(),
  dataExtractionModelPreset: z.string<ModelPreset>(),
});

export type FileUploadForm = z.infer<typeof fileUploadSchema>;
