import { v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { mutation } from "../../_generated/server";
import { authComponent } from "../../auth";
import { vModelPreset } from "./validators";

export const handleEnqueueAiInvoiceAnalysis = mutation({
  args: {
    pdfAnalysisModelPreset: vModelPreset,
    dataExtractionModelPreset: vModelPreset,
    files: v.array(
      v.object({
        name: v.string(),
        size: v.number(),
        type: v.string(),
        fileKey: v.string(),
        imageFileKeys: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    console.log(args);

    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("User not found");
    }
    const userId = authUser._id;
    console.log("userId", userId);

    const localUser = await ctx.db
      .query("users")
      .withIndex("externalId", (q) => q.eq("externalId", userId))
      .first();
    if (!localUser) {
      throw new Error("User not found");
    }

    const analysisWorkflowHeaderId = await ctx.db.insert(
      "analysisWorkflowHeaders",
      {
        filesCount: args.files.length,
        pdfAnalysisModelPreset: args.pdfAnalysisModelPreset,
        dataExtractionModelPreset: args.dataExtractionModelPreset,
        createdByUserId: localUser._id,
        lastUpdatedTime: Date.now(),
      },
    );

    for (const file of args.files) {
      const workflowId = await workflow.start(
        ctx,
        internal.domains.analyzeInvoice.workflows.aiInvoiceAnalysisWorkflow,
        {
          userId: localUser._id,
          analysisWorkflowHeaderId,
          pdfAnalysisModelPreset: args.pdfAnalysisModelPreset,
          dataExtractionModelPreset: args.dataExtractionModelPreset,
          fileKey: file.fileKey,
          imageFileKeys: file.imageFileKeys,
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
        imageFileKeys: file.imageFileKeys,
        lastUpdatedTime: Date.now(),
      });
    }

    return analysisWorkflowHeaderId;
  },
});
