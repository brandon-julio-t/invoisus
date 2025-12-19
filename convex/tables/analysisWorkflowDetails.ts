import { vWorkflowId } from "@convex-dev/workflow";
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const analysisWorkflowDetails = defineTable({
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
  ]);
