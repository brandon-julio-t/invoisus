import { ConvexError } from "convex/values";
import { workflow } from "../../../..";
import { internal } from "../../../../_generated/api";
import type { Id } from "../../../../_generated/dataModel";
import type { MutationCtx } from "../../../../_generated/server";
import type { ModelPreset } from "../../../analyzeInvoice/aiModelFactory";

export async function retryOneAnalysisWorkflowDetailLogic({
  ctx,
  userId,
  analysisWorkflowDetailId,
}: {
  ctx: MutationCtx;
  userId: Id<"users">;
  analysisWorkflowDetailId: Id<"analysisWorkflowDetails">;
}) {
  const analysisWorkflowDetail = await ctx.db.get(
    "analysisWorkflowDetails",
    analysisWorkflowDetailId,
  );
  console.log("analysisWorkflowDetail", analysisWorkflowDetail);
  if (!analysisWorkflowDetail) {
    throw new ConvexError("Analysis workflow detail not found");
  }

  if (analysisWorkflowDetail.status !== "failed") {
    throw new ConvexError("Can only retry failed analysis workflow details");
  }

  const analysisWorkflowHeader = await ctx.db.get(
    "analysisWorkflowHeaders",
    analysisWorkflowDetail.analysisWorkflowHeaderId,
  );
  console.log("analysisWorkflowHeader", analysisWorkflowHeader);
  if (!analysisWorkflowHeader) {
    throw new ConvexError("Analysis workflow header not found");
  }

  await ctx.db.patch("analysisWorkflowHeaders", analysisWorkflowHeader._id, {
    failedCount: (analysisWorkflowHeader.failedCount ?? 0) - 1,
    lastUpdatedTime: Date.now(),
  });

  const workflowId = await workflow.start(
    ctx,
    internal.domains.analyzeInvoice.workflows.aiInvoiceAnalysisWorkflow,
    {
      userId: userId,
      analysisWorkflowHeaderId: analysisWorkflowHeader._id,
      pdfAnalysisModelPreset:
        analysisWorkflowHeader.pdfAnalysisModelPreset as ModelPreset,
      dataExtractionModelPreset:
        analysisWorkflowHeader.dataExtractionModelPreset as ModelPreset,
      fileKey: analysisWorkflowDetail.fileKey,
      imageFileKeys: analysisWorkflowDetail.imageFileKeys ?? [],
      version: analysisWorkflowHeader.version,
    },
    {
      onComplete:
        internal.domains.analyzeInvoice.internalMutations
          .aiInvoiceAnalysisWorkflowComplete,
      context: analysisWorkflowHeader._id,
      startAsync: true,
    },
  );

  console.log("workflowId", workflowId);

  await ctx.db.patch("analysisWorkflowDetails", analysisWorkflowDetail._id, {
    workflowId,
    status: "queued",
    lastUpdatedTime: Date.now(),
  });
}
