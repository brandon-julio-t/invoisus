import { components } from "@/convex/_generated/api";
import { internalMutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const stopAllProcessingWorkflows = internalMutation({
  args: {
    areYouSure: v.literal("yes"),
  },
  handler: async (ctx, args) => {
    console.log(args);

    const analysisWorkflowDetails = await ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .collect();

    for (const analysisWorkflowDetail of analysisWorkflowDetails) {
      console.log("cancelling:", analysisWorkflowDetail);
      await ctx.runMutation(components.workflow.workflow.cancel, {
        workflowId: analysisWorkflowDetail.workflowId,
      });
      console.log("cancelled:", analysisWorkflowDetail);
    }
  },
});
