import { vWorkflowId } from "@convex-dev/workflow";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { vModelPreset } from "./domains/analyzeInvoice/validators";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    /** for better-auth/clerk/workos/other auth providers user id */
    externalId: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("externalId", ["externalId"]),

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
  }),

  analysisWorkflowHeaders: defineTable({
    filesCount: v.number(),
    pdfAnalysisModelPreset: v.string(),
    dataExtractionModelPreset: v.string(),
    successCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
    createdByUserId: v.optional(v.id("users")),
    lastUpdatedTime: v.optional(v.number()),
  }),

  analysisWorkflowDetails: defineTable({
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
    workflowId: vWorkflowId,
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileKey: v.string(),
    imageFileKeys: v.optional(v.array(v.string())),
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
    lastUpdatedTime: v.optional(v.number()),
  })
    .index("by_status", ["status"])

    .index("by_analysisWorkflowHeaderId_workflowId", [
      "analysisWorkflowHeaderId",
      "workflowId",
    ])

    .index("by_analysisWorkflowHeaderId_status", [
      "analysisWorkflowHeaderId",
      "status",
    ])

    .index("by_analysisWorkflowHeaderId_problemExistenceType", [
      "analysisWorkflowHeaderId",
      "problemExistanceType",
    ]),
});
