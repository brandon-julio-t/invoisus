import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { generateText, stepCountIs } from "ai";
import { partial } from "convex-helpers/validators";
import { v } from "convex/values";
import { workflow } from ".";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server";
import schema from "./schema";
import { vWorkflowId, WorkflowId } from "@convex-dev/workflow";
import { vResultValidator } from "@convex-dev/workpool";
import { r2 } from "./r2";

export const handleEnqueueAiInvoiceAnalysis = mutation({
  args: {
    files: v.array(
      v.object({
        name: v.string(),
        size: v.number(),
        type: v.string(),
        fileKey: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    console.log(args);

    const analysisWorkflowHeaderId = await ctx.db.insert(
      "analysisWorkflowHeaders",
      {
        filesCount: args.files.length,
      },
    );

    for (const file of args.files) {
      const workflowId = await workflow.start(
        ctx,
        internal.myFunctions.aiInvoiceAnalysisWorkflow,
        {
          analysisWorkflowHeaderId,
          fileKey: file.fileKey,
        },
        {
          onComplete: internal.myFunctions.aiInvoiceAnalysisWorkflowComplete,
          context: analysisWorkflowHeaderId,
        },
      );

      await ctx.db.insert("analysisWorkflowDetails", {
        analysisWorkflowHeaderId,
        workflowId,
        status: "queued",
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileKey: file.fileKey,
      });
    }
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
      const analysisResult = args.result.returnValue.data;

      await ctx.db.patch(analysisWorkflowDetail._id, {
        status: "success",
        errorMessage: undefined,
        analysisResult: analysisResult,
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
      internal.myFunctions.getAnalysisWorkflowDetail,
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

    await step.runMutation(internal.myFunctions.updateAnalysisWorkflowDetail, {
      id: analysisWorkflowDetail._id,
      data: {
        status: "processing",
      },
    });

    console.log("Analyzing invoice with AI");

    const aiAnalysisResult = await step.runAction(
      internal.myFunctions.analyzeInvoiceWithAi,
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

export const getAnalysisWorkflowDetail = internalQuery({
  args: {
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
    workflowId: vWorkflowId,
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    return await ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_analysis_workflow_header_id_and_workflow_id", (q) =>
        q
          .eq("analysisWorkflowHeaderId", args.analysisWorkflowHeaderId)
          .eq("workflowId", args.workflowId),
      )
      .unique();
  },
});

export const updateAnalysisWorkflowDetail = internalMutation({
  args: {
    id: v.id("analysisWorkflowDetails"),
    data: partial(schema.tables.analysisWorkflowDetails.validator),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const { id, data } = args;

    await ctx.db.patch(id, {
      analysisResult: data.analysisResult,
    });
  },
});

export const analyzeInvoiceWithAi = internalAction({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileKey: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const fileUrl = await r2.getUrl(args.fileKey);
    console.log("fileUrl", fileUrl);

    const result = await generateText({
      model: openai("gpt-5-mini"),

      providerOptions: {
        openai: {
          reasoningEffort: "minimal",
        } satisfies OpenAIResponsesProviderOptions,
      },

      stopWhen: stepCountIs(20),

      prompt: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: fileUrl,
              mediaType: args.fileType,
              filename: args.fileName,
            },
          ],
        },
      ],
    });

    console.log("result", result);

    return result.text;
  },
});
