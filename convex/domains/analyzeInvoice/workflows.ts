import { WorkflowId } from "@convex-dev/workflow";
import { v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { vModelPreset } from "./validators";

export const aiInvoiceAnalysisWorkflow = workflow.define({
  args: {
    userId: v.id("users"),
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
    pdfAnalysisModelPreset: vModelPreset,
    dataExtractionModelPreset: vModelPreset,
    fileKey: v.string(),
    imageFileKeys: v.array(v.string()),
  },
  handler: async (step, args) => {
    console.log("step.workflowId", step.workflowId);
    console.log("args", args);

    const analysisWorkflowDetail = await step.runQuery(
      internal.domains.analyzeInvoice.internalQueries
        .getAnalysisWorkflowDetailByWorkflowId,
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
      internal.domains.analysisWorkflowDetails.internalCrud.update,
      {
        id: analysisWorkflowDetail._id,
        patch: {
          status: "processing",
          lastUpdatedTime: Date.now(),
        },
      },
    );

    console.log("Analyzing invoice with AI");

    const aiAnalysisResult = await step.runAction(
      internal.domains.analyzeInvoice.internalNodeActions.analyzeInvoiceWithAi,
      {
        userId: args.userId,
        workflowId: step.workflowId as WorkflowId,
        modelPreset: args.pdfAnalysisModelPreset,
        fileName: analysisWorkflowDetail.fileName,
        fileSize: analysisWorkflowDetail.fileSize,
        fileType: analysisWorkflowDetail.fileType,
        fileKey: analysisWorkflowDetail.fileKey,
        imageFileKeys: args.imageFileKeys,
      },
    );

    console.log("AI analysis result", aiAnalysisResult);

    await step.runMutation(
      internal.domains.analysisWorkflowDetails.internalCrud.update,
      {
        id: analysisWorkflowDetail._id,
        patch: {
          analysisResult: aiAnalysisResult.text,
          lastUpdatedTime: Date.now(),
        },
      },
    );

    const aiDataExtractionResult = await step.runAction(
      internal.domains.analyzeInvoice.internalNodeActions
        .extractDataFromInvoiceWithAi,
      {
        userId: args.userId,
        workflowId: step.workflowId as WorkflowId,
        modelPreset: args.dataExtractionModelPreset,
        supplementaryAnalysisResult: aiAnalysisResult.text,
        fileName: analysisWorkflowDetail.fileName,
        fileSize: analysisWorkflowDetail.fileSize,
        fileType: analysisWorkflowDetail.fileType,
        fileKey: analysisWorkflowDetail.fileKey,
      },
    );

    console.log("AI data extraction result", aiDataExtractionResult);

    await step.runMutation(
      internal.domains.analysisWorkflowDetails.internalCrud.update,
      {
        id: analysisWorkflowDetail._id,
        patch: {
          dataExtractionResult: aiDataExtractionResult,
          problemExistanceType: aiDataExtractionResult.problemExistanceType as
            | "certainly has problem"
            | "not certain",
          lastUpdatedTime: Date.now(),
        },
      },
    );
  },
});
