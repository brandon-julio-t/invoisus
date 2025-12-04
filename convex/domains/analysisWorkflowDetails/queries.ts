import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../../_generated/server";

export const getAnalysisWorkflowDetails = query({
  args: {
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new Error("User not found");
    }

    return await ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_analysis_workflow_header_id_and_workflow_id", (q) =>
        q.eq("analysisWorkflowHeaderId", args.analysisWorkflowHeaderId),
      )
      .paginate(args.paginationOpts);
  },
});
