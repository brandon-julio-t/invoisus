import { defineTable } from "convex/server";
import { v } from "convex/values";

export const analysisWorkflowHeaders = defineTable({
  filesCount: v.number(),
  pdfAnalysisModelPreset: v.string(),
  dataExtractionModelPreset: v.string(),
  successCount: v.optional(v.number()),
  failedCount: v.optional(v.number()),
  createdByUserId: v.optional(v.id("users")),
  lastUpdatedTime: v.optional(v.number()),
});
