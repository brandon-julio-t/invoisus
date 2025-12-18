import { paginationOptsValidator, type PaginationResult } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import { authComponent } from "../../auth";

export const getAnalysisWorkflowDetails = query({
  args: {
    analysisWorkflowHeaderId: v.id("analysisWorkflowHeaders"),
    filterType: v.optional(
      v.union(
        v.literal("all"),
        //
        v.literal("processing"),
        v.literal("success"),
        v.literal("failed"),
        //
        v.literal("certainly has problem"),
        v.literal("not certain"),
      ),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const authUser = await authComponent.safeGetAuthUser(ctx);
    console.log("authUser", authUser);
    if (!authUser) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      } satisfies PaginationResult<Doc<"analysisWorkflowDetails">>;
    }

    let queryIndexed = ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_analysisWorkflowHeaderId_problemExistenceType", (q) =>
        q.eq("analysisWorkflowHeaderId", args.analysisWorkflowHeaderId),
      );

    const problemExistanceType = args.filterType ?? "all";
    if (problemExistanceType !== "all") {
      switch (problemExistanceType) {
        case "failed":
        case "success":
        case "processing":
          queryIndexed = ctx.db
            .query("analysisWorkflowDetails")
            .withIndex("by_analysisWorkflowHeaderId_status", (q) =>
              q
                .eq("analysisWorkflowHeaderId", args.analysisWorkflowHeaderId)
                .eq("status", problemExistanceType),
            );

          break;

        case "certainly has problem":
        case "not certain":
          queryIndexed = ctx.db
            .query("analysisWorkflowDetails")
            .withIndex(
              "by_analysisWorkflowHeaderId_problemExistenceType",
              (q) =>
                q
                  .eq("analysisWorkflowHeaderId", args.analysisWorkflowHeaderId)
                  .eq("problemExistanceType", problemExistanceType),
            );

          break;
      }
    }

    const paginated = await queryIndexed
      .order("asc")
      .paginate(args.paginationOpts);
    return {
      ...paginated,
      page: paginated.page.map((item) => {
        let problemExistanceType:
          | typeof item.problemExistanceType
          | "no problem" = item.problemExistanceType;

        if (problemExistanceType === "not certain") {
          problemExistanceType = "no problem";
        }

        return {
          ...item,

          problemExistanceType,
        };
      }),
    };
  },
});
