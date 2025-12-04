import { vWorkflowId } from "@convex-dev/workflow";
import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";

export const getAnalysisWorkflowDetailByWorkflowId = internalQuery({
  args: {
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
    workflowId: vWorkflowId,
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    return await ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_analysisWorkflowHeaderId_workflowId", (q) =>
        q
          .eq("analysisWorkflowHeaderId", args.analysisWorkflowHeaderId)
          .eq("workflowId", args.workflowId),
      )
      .unique();
  },
});
