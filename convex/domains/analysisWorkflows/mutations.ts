import { ConvexError, v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { mutation } from "../../_generated/server";
import { authComponent } from "../../auth";
import { retryOneAnalysisWorkflowDetailLogic } from "../analysisWorkflowDetails/core/retryOneAnalysisWorkflowDetailLogic";

export const retryAllFailedAnalysisWorkflowDetails = mutation({
  args: {
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new ConvexError("User not found");
    }
    const userId = authUser._id as string;
    console.log("userId", userId);

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
        userId: userId as unknown as Id<"users">,
        analysisWorkflowDetailId: analysisWorkflowDetail._id,
      });
    }
  },
});
