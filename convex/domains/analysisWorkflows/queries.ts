import type { PaginationResult } from "convex/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../../_generated/server";
import { authComponent } from "../../auth";

export const getPaginatedAnalysisWorkflowHeaders = query({
  args: {
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
      } satisfies PaginationResult<unknown>;
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
              ? await ctx.db.get("users", item?.createdByUserId)
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

    const authUser = await authComponent.safeGetAuthUser(ctx);
    console.log("authUser", authUser);
    if (!authUser) {
      return null;
    }
    const userId = authUser._id as string;
    console.log("userId", userId);

    const header = await ctx.db.get("analysisWorkflowHeaders", args.id);
    if (!header) {
      return null;
    }
    return {
      ...header,
      createdByUser: header?.createdByUserId
        ? await ctx.db.get("users", header?.createdByUserId)
        : null,
    };
  },
});
