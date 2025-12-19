import { defineTable } from "convex/server";
import { v } from "convex/values";
import { vModelPreset } from "../domains/analyzeInvoice/validators";

export const analysisConfigurations = defineTable({
  pdfAnalysisModelId: v.optional(vModelPreset),
  pdfAnalysisPrompt: v.string(),
  dataExtractionModelId: v.optional(vModelPreset),
  dataExtractionPrompt: v.string(),
  googleSheetConfigurationByVendor: v.optional(
    v.record(
      v.string(),
      v.object({
        spreadsheetId: v.string(),
        sheetName: v.string(),
      }),
    ),
  ),
});
