import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { components } from "../../_generated/api";
import { query } from "../../_generated/server";

export const getPaginatedAnalysisWorkflowHeaders = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new Error("User not found");
    }

    const paginated = await ctx.db
      .query("analysisWorkflowHeaders")
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...paginated,

      page: await Promise.all(
        paginated.page.map(async (item) => {
          return {
            ...item,
            createdByUser: item?.createdByUserId
              ? await ctx.db.get(item?.createdByUserId)
              : null,
          };
        }),
      ),
    };
  },
});

export const getAnalysisWorkflowHeaderById = query({
  args: {
    id: v.id("analysisWorkflowHeaders"),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new Error("User not found");
    }

    const header = await ctx.db.get(args.id);
    return {
      ...header,
      createdByUser: header?.createdByUserId
        ? await ctx.db.get(header?.createdByUserId)
        : null,
    };
  },
});

export const getAnalysisWorkflowDetailsByHeaderId = query({
  args: {
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new Error("User not found");
    }

    const details = await ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_analysis_workflow_header_id_and_workflow_id", (q) =>
        q.eq("analysisWorkflowHeaderId", args.analysisWorkflowHeaderId),
      )
      .collect();

    const enrichedDetails = await Promise.all(
      details.map(async (detail) => {
        return {
          ...detail,

          internalWorkflowStatus: await ctx
            .runQuery(components.workflow.workflow.getStatus, {
              workflowId: detail.workflowId,
            })
            .catch((error) => {
              console.error("Error getting workflow status", error);
              return null;
            }),
        };
      }),
    );

    return {
      data: enrichedDetails,

      stats: {
        successCount: enrichedDetails.filter(
          (detail) => detail.status === "success",
        ).length,
        failedCount: enrichedDetails.filter(
          (detail) => detail.status === "failed",
        ).length,
        queuedCount: enrichedDetails.filter(
          (detail) => detail.status === "queued",
        ).length,
        processingCount: enrichedDetails.filter(
          (detail) => detail.status === "processing",
        ).length,
      },
    };
  },
});
