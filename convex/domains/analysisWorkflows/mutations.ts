import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import { retryOneAnalysisWorkflowDetailLogic } from "../analysisWorkflowDetails/core/retryOneAnalysisWorkflowDetailLogic";
import { getUserByBetterAuth } from "../users/logics";

export const retryAllFailedAnalysisWorkflowDetails = mutation({
  args: {
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const user = await getUserByBetterAuth({ ctx });
    console.log("user", user);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const analysisWorkflowHeader = await ctx.db.get(
      "analysisWorkflowHeaders",
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
        userId: user._id,
        analysisWorkflowDetailId: analysisWorkflowDetail._id,
      });
    }
  },
});
