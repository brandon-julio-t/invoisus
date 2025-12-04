import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
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
