import { vWorkflowId } from "@convex-dev/workflow";
import { vResultValidator } from "@convex-dev/workpool";
import { partial } from "convex-helpers/validators";
import { v } from "convex/values";
import { workflow } from "../..";
import { internalMutation } from "../../_generated/server";
import schema from "../../schema";

export const updateAnalysisWorkflowDetail = internalMutation({
  args: {
    id: v.id("analysisWorkflowDetails"),
    data: partial(schema.tables.analysisWorkflowDetails.validator),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const { id, data } = args;

    await ctx.db.patch(id, data);
  },
});

export const aiInvoiceAnalysisWorkflowComplete = internalMutation({
  args: {
    workflowId: vWorkflowId,
    result: vResultValidator,
    context: v.any(), // used to pass through data from the start site.
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const analysisWorkflowHeaderId = args.context;

    const analysisWorkflowDetail = await ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_analysis_workflow_header_id_and_workflow_id", (q) =>
        q
          .eq("analysisWorkflowHeaderId", analysisWorkflowHeaderId)
          .eq("workflowId", args.workflowId),
      )
      .unique();

    if (analysisWorkflowDetail) {
      if (args.result.kind === "success") {
        await ctx.db.patch(analysisWorkflowDetail._id, {
          status: "success",
          errorMessage: undefined,
        });
      } else if (args.result.kind === "failed") {
        const errorMessage = args.result.error;

        await ctx.db.patch(analysisWorkflowDetail._id, {
          status: "failed",
          errorMessage: errorMessage,
        });
      } else if (args.result.kind === "canceled") {
        await ctx.db.patch(analysisWorkflowDetail._id, {
          status: "queued",
          errorMessage: "Workflow canceled",
        });
      }
    } else {
      console.error("Analysis workflow detail not found");
    }

    console.log("Cleaning up workflow", args.workflowId);

    await workflow.cleanup(ctx, args.workflowId);
  },
});
