import { v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { internalAction, internalQuery } from "../../_generated/server";

export const getAllProcessingAnalysisWorkflowDetails = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .collect();
  },
});

export const stopAllProcessingWorkflows = internalAction({
  args: {
    areYouSure: v.literal("yes"),
  },
  handler: async (ctx, args) => {
    console.log(args);

    const analysisWorkflowDetails = await ctx.runQuery(
      internal.admin.console.dangerousFunctions
        .getAllProcessingAnalysisWorkflowDetails,
      {},
    );

    for (const analysisWorkflowDetail of analysisWorkflowDetails) {
      console.log(
        "cancelling analysis workflow detail:",
        analysisWorkflowDetail,
      );

      if (
        analysisWorkflowDetail.status === "failed" ||
        analysisWorkflowDetail.status === "success"
      ) {
        console.log(
          "skipping because it's already finished:",
          analysisWorkflowDetail,
        );
        continue;
      }

      await workflow
        .cancel(ctx, analysisWorkflowDetail.workflowId)
        .then((result) => {
          console.log(
            "cancelled analysis workflow detail:",
            analysisWorkflowDetail,
          );

          console.log("cancelled result:", result);
        })
        .catch((error) => {
          console.error("error cancelling analysis workflow detail:", error);
        });
    }
  },
});
