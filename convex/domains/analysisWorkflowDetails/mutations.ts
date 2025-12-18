import { ConvexError, v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { mutation } from "../../_generated/server";
import { authComponent } from "../../auth";
import { retryOneAnalysisWorkflowDetailLogic } from "./core/retryOneAnalysisWorkflowDetailLogic";

export const retryOneAnalysisWorkflowDetail = mutation({
  args: {
    analysisWorkflowDetailId: v.id("analysisWorkflowDetails"),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new ConvexError("User not found");
    }
    const userId = authUser._id as string;
    console.log("userId", userId);

    await retryOneAnalysisWorkflowDetailLogic({
      ctx,
      userId: userId as unknown as Id<"users">,
      analysisWorkflowDetailId: args.analysisWorkflowDetailId,
    });
  },
});
