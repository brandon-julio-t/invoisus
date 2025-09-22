import { WorkflowId } from "@convex-dev/workflow";
import { v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";

export const aiInvoiceAnalysisWorkflow = workflow.define({
  args: {
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
    fileKey: v.string(),
  },
  handler: async (
    step,
    args,
  ): Promise<{
    data: string;
  }> => {
    console.log("step.workflowId", step.workflowId);
    console.log("args", args);

    const analysisWorkflowDetail = await step.runQuery(
      internal.domains.analyzeInvoice.internalQueries.getAnalysisWorkflowDetail,
      {
        analysisWorkflowHeaderId: args.analysisWorkflowHeaderId,
        workflowId: step.workflowId as WorkflowId,
      },
    );

    console.log("analysisWorkflowDetail", analysisWorkflowDetail);

    if (!analysisWorkflowDetail) {
      throw new Error("Analysis workflow detail not found");
    }

    console.log("Updating analysis workflow detail status to processing");

    await step.runMutation(
      internal.domains.analyzeInvoice.internalMutations
        .updateAnalysisWorkflowDetail,
      {
        id: analysisWorkflowDetail._id,
        data: {
          status: "processing",
        },
      },
    );

    console.log("Analyzing invoice with AI");

    const aiAnalysisResult = await step.runAction(
      internal.domains.analyzeInvoice.internalActions.analyzeInvoiceWithAi,
      {
        fileName: analysisWorkflowDetail.fileName,
        fileSize: analysisWorkflowDetail.fileSize,
        fileType: analysisWorkflowDetail.fileType,
        fileKey: analysisWorkflowDetail.fileKey,
      },
    );

    console.log("AI analysis result", aiAnalysisResult);

    return {
      data: aiAnalysisResult,
    };
  },
});
