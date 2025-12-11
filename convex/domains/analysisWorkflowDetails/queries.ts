import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../../_generated/server";

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

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new Error("User not found");
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
        } else {
          problemExistanceType = "certainly has problem";
        }

        return {
          ...item,

          problemExistanceType,
        };
      }),
    };
  },
});
