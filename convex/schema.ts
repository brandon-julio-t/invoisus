import { authTables } from "@convex-dev/auth/server";
import { vWorkflowId } from "@convex-dev/workflow";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,

  customers: defineTable({
    /** alternative ID from S&F */
    number: v.string(),
    name: v.string(),
    group: v.string(),
    problemType: v.string(),
  })
    .index("by_number", ["number"])
    .index("by_problemType", ["problemType"])
    .searchIndex("search_number", { searchField: "number" })
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_group", { searchField: "group" }),

  analysisConfigurations: defineTable({
    pdfAnalysisPrompt: v.string(),
    dataExtractionPrompt: v.string(),
  }),

  analysisWorkflowHeaders: defineTable({
    filesCount: v.number(),
    pdfAnalysisModelPreset: v.string(),
    dataExtractionModelPreset: v.string(),
    createdByUserId: v.optional(v.id("users")),
  }),

  analysisWorkflowDetails: defineTable({
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
    workflowId: vWorkflowId,
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileKey: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("success"),
      v.literal("failed"),
    ),
    errorMessage: v.optional(v.string()),
    analysisResult: v.optional(v.string()),
    dataExtractionResult: v.optional(v.record(v.string(), v.string())),
    problemExistanceType: v.optional(
      v.union(v.literal("certainly has problem"), v.literal("not certain")),
    ),
  }).index("by_analysis_workflow_header_id_and_workflow_id", [
    "analysisWorkflowHeaderId",
    "workflowId",
  ]),
});
