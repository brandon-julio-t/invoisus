import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import { retryOneAnalysisWorkflowDetailLogic } from "../analysisWorkflowDetails/core/retry-one-analysis-workflow-detail-logic";

export const retryAllFailedAnalysisWorkflowDetails = mutation({
  args: {
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new ConvexError("User not found");
    }

    const analysisWorkflowHeader = await ctx.db.get(
      args.analysisWorkflowHeaderId,
    );
    console.log("analysisWorkflowHeader", analysisWorkflowHeader);
    if (!analysisWorkflowHeader) {
      throw new ConvexError("Analysis workflow header not found");
    }

    const analysisWorkflowDetails = await ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_analysisWorkflowHeaderId_status", (q) =>
        q
          .eq("analysisWorkflowHeaderId", args.analysisWorkflowHeaderId)
          .eq("status", "failed"),
      )
      .collect();

    console.log(
      `Retrying ${analysisWorkflowDetails.length} failed analysis workflow details...`,
    );

    for (const analysisWorkflowDetail of analysisWorkflowDetails) {
      console.log(
        `Retrying failed analysis workflow detail: ${analysisWorkflowDetail._id}`,
      );

      await retryOneAnalysisWorkflowDetailLogic({
        ctx,
        userId,
        analysisWorkflowDetailId: analysisWorkflowDetail._id,
      });
    }
  },
});
