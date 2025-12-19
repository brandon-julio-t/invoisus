import type { WorkflowId } from "@convex-dev/workflow";
import { v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import schema from "../../schema";
import { vModelPreset } from "./validators";

export const aiInvoiceAnalysisWorkflow = workflow.define({
  args: {
    userId: v.id("users"),
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
    pdfAnalysisModelPreset: vModelPreset,
    dataExtractionModelPreset: vModelPreset,
    fileKey: v.string(),
    imageFileKeys: v.array(v.string()),
    version: schema.tables.analysisWorkflowHeaders.validator.fields.version,
  },
  handler: async (step, args) => {
    console.log("step.workflowId", step.workflowId);
    console.log(step.workflowId, "args", args);

    const analysisWorkflowDetail = await step.runQuery(
      internal.domains.analyzeInvoice.internalQueries
        .getAnalysisWorkflowDetailByWorkflowId,
      {
        analysisWorkflowHeaderId: args.analysisWorkflowHeaderId,
        workflowId: step.workflowId as WorkflowId,
      },
    );

    console.log(
      step.workflowId,
      "analysisWorkflowDetail",
      analysisWorkflowDetail,
    );

    if (!analysisWorkflowDetail) {
      throw new Error("Analysis workflow detail not found");
    }

    console.log(
      step.workflowId,
      "Updating analysis workflow detail status to processing",
    );

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

    console.log(step.workflowId, "Analyzing invoice with AI");

    let aiAnalysisResult: { text: string } = {
      text: "",
    };

    if (args.version === "v1") {
      const result = await step.runAction(
        internal.domains.analyzeInvoice.internalNodeActions.analyzeInvoiceWithAi
          .internalActionFn,
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

      aiAnalysisResult = result;
    } else if (args.version === "v2") {
      const result = await step.runAction(
        internal.domains.analyzeInvoice.internalNodeActions
          .analyzeInvoiceWithAiV2.internalActionFn,
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

      aiAnalysisResult = result;
    } else {
      console.error("Invalid version", args.version);
    }

    console.log(step.workflowId, "AI analysis result", aiAnalysisResult);

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
        .extractDataFromInvoiceWithAi.internalActionFn,
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

    console.log(
      step.workflowId,
      "AI data extraction result",
      aiDataExtractionResult,
    );

    const problemExistanceType = aiDataExtractionResult.problemExistanceType as
      | "certainly has problem"
      | "not certain";

    await step.runMutation(
      internal.domains.analysisWorkflowDetails.internalCrud.update,
      {
        id: analysisWorkflowDetail._id,
        patch: {
          dataExtractionResult: aiDataExtractionResult,
          problemExistanceType: problemExistanceType,
          lastUpdatedTime: Date.now(),
        },
      },
    );

    console.log(step.workflowId, "updated analysis workflow detail");

    if (problemExistanceType !== "certainly has problem") {
      console.log(
        step.workflowId,
        'Skipping appending AI data extraction result to Google Spreadsheet because problem existence type is not "certainly has problem"',
      );

      return;
    }

    console.log(
      step.workflowId,
      "Appending AI data extraction result to Google Spreadsheet",
    );

    await step.runAction(
      internal.domains.analyzeInvoice.internalNodeActions
        .appendAiDataExtractionResultToGoogleSpreadsheet.internalActionFn,
      {
        aiDataExtractionResult: aiDataExtractionResult,
      },
    );

    console.log(
      step.workflowId,
      "AI data extraction result appended to Google Spreadsheet",
    );
  },
});
