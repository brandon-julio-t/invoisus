import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { components } from "../../_generated/api";
import { query } from "../../_generated/server";

export const getPaginatedAnalysisWorkflowHeaders = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analysisWorkflowHeaders")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getAnalysisWorkflowDetail = query({
  args: {
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
  },
  handler: async (ctx, args) => {
    const header = await ctx.db.get(args.analysisWorkflowHeaderId);

    if (!header) {
      throw new Error("Analysis workflow header not found");
    }

    const details = await ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_analysis_workflow_header_id_and_workflow_id", (q) =>
        q.eq("analysisWorkflowHeaderId", args.analysisWorkflowHeaderId),
      )
      .collect();

    return {
      header,
      details: await Promise.all(
        details.map(async (detail) => {
          const workflowStatus = await ctx
            .runQuery(components.workflow.workflow.getStatus, {
              workflowId: detail.workflowId,
            })
            .catch(() => null);

          return {
            ...detail,
            workflowStatus,
          };
        }),
      ),
    };
  },
});
