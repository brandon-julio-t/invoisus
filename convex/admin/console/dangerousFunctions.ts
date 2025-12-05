import { workflow } from "@/convex";
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
