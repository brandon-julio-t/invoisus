import { vWorkflowId } from "@convex-dev/workflow";
import { vResultValidator } from "@convex-dev/workpool";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { internalMutation } from "../../_generated/server";

export const aiInvoiceAnalysisWorkflowComplete = internalMutation({
  args: {
    workflowId: vWorkflowId,
    result: vResultValidator,
    context: v.any(), // used to pass through data from the start site.
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const analysisWorkflowHeaderId =
      args.context as Id<"analysisWorkflowHeaders">;

    const analysisWorkflowHeader = await ctx.db.get(analysisWorkflowHeaderId);
    if (!analysisWorkflowHeader) {
      throw new Error("Analysis workflow header not found");
    }

    const analysisWorkflowDetail = await ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_analysisWorkflowHeaderId_workflowId", (q) =>
        q
          .eq("analysisWorkflowHeaderId", analysisWorkflowHeaderId)
          .eq("workflowId", args.workflowId),
      )
      .unique();

    if (!analysisWorkflowDetail) {
      throw new Error("Analysis workflow detail not found");
    }

    const currentTime = Date.now();

    const isSuccess = args.result.kind === "success";

    if (args.result.kind === "success") {
      await ctx.db.patch(analysisWorkflowDetail._id, {
        status: "success",
        errorMessage: undefined,
        lastUpdatedTime: currentTime,
      });
    } else if (args.result.kind === "failed") {
      const errorMessage = args.result.error;

      await ctx.db.patch(analysisWorkflowDetail._id, {
        status: "failed",
        errorMessage: errorMessage,
        problemExistanceType: "certainly has problem",
        lastUpdatedTime: currentTime,
      });
    } else if (args.result.kind === "canceled") {
      await ctx.db.patch(analysisWorkflowDetail._id, {
        status: "failed",
        errorMessage: "Workflow canceled",
        lastUpdatedTime: currentTime,
      });
    }

    await ctx.db.patch(analysisWorkflowHeaderId, {
      lastUpdatedTime: currentTime,

      successCount: isSuccess
        ? (analysisWorkflowHeader.successCount ?? 0) + 1
        : (analysisWorkflowHeader.successCount ?? 0),

      failedCount: isSuccess
        ? (analysisWorkflowHeader.failedCount ?? 0)
        : (analysisWorkflowHeader.failedCount ?? 0) + 1,
    });
  },
});
