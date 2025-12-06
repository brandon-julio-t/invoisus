import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import { retryOneAnalysisWorkflowDetailLogic } from "./core/retryOneAnalysisWorkflowDetailLogic";

export const retryOneAnalysisWorkflowDetail = mutation({
  args: {
    analysisWorkflowDetailId: v.id("analysisWorkflowDetails"),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new ConvexError("User not found");
    }

    await retryOneAnalysisWorkflowDetailLogic({
      ctx,
      userId,
      analysisWorkflowDetailId: args.analysisWorkflowDetailId,
    });
  },
});
