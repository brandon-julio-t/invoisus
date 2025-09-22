import { vWorkflowId } from "@convex-dev/workflow";
import { vResultValidator } from "@convex-dev/workpool";
import { partial } from "convex-helpers/validators";
import { FunctionReturnType } from "convex/server";
import { v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
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

    if (!analysisWorkflowDetail) {
      console.error("Analysis workflow detail not found");
      return;
    }

    if (args.result.kind === "success") {
      const analysisResult: FunctionReturnType<
        typeof internal.domains.analyzeInvoice.internalActions.analyzeInvoiceWithAi
      > = args.result.returnValue.data;

      await ctx.db.patch(analysisWorkflowDetail._id, {
        status: "success",
        errorMessage: undefined,
        analysisResult: analysisResult.analysisResult,
        dataExtractionResult: analysisResult.dataExtractionResult,
        problemExistanceType:
          analysisResult.dataExtractionResult.problemExistanceType,
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

    console.log("Cleaning up workflow", args.workflowId);

    await workflow.cleanup(ctx, args.workflowId);
  },
});
