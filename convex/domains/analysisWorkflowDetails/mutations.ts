import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getUserByBetterAuth } from "../users/logics";
import { retryOneAnalysisWorkflowDetailLogic } from "./core/retryOneAnalysisWorkflowDetailLogic";

export const retryOneAnalysisWorkflowDetail = mutation({
  args: {
    analysisWorkflowDetailId: v.id("analysisWorkflowDetails"),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const user = await getUserByBetterAuth({ ctx });
    console.log("user", user);
    if (!user) {
      throw new ConvexError("User not found");
    }

    await retryOneAnalysisWorkflowDetailLogic({
      ctx,
      userId: user._id,
      analysisWorkflowDetailId: args.analysisWorkflowDetailId,
    });
  },
});
