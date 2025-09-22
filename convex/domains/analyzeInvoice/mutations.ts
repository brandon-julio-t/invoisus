import { v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { mutation } from "../../_generated/server";

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
        internal.domains.analyzeInvoice.workflows.aiInvoiceAnalysisWorkflow,
        {
          analysisWorkflowHeaderId,
          fileKey: file.fileKey,
        },
        {
          onComplete:
            internal.domains.analyzeInvoice.internalMutations
              .aiInvoiceAnalysisWorkflowComplete,
          context: analysisWorkflowHeaderId,
          startAsync: true,
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

    return analysisWorkflowHeaderId;
  },
});
