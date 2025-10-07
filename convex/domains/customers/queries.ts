import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

export const getCustomersListPaginated = query({
  args: {
    search: v.optional(v.string()),
    searchField: v.optional(
      v.union(
        v.literal("number"),
        v.literal("name"),
        v.literal("group"),
        v.literal("problemType"),
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

    const { search, searchField } = args;
    if (search && searchField) {
      switch (searchField) {
        case "number":
          return await ctx.db
            .query("customers")
            // Number.gte is similar with String.startsWith
            .withIndex("by_number", (q) => q.gte("number", search))
            // but we need to sort the Number asc so that relevant results
            .order("asc")
            .paginate(args.paginationOpts);

        case "name":
          return await ctx.db
            .query("customers")
            .withSearchIndex("search_name", (q) => q.search("name", search))
            .paginate(args.paginationOpts);

        case "group":
          return await ctx.db
            .query("customers")
            .withSearchIndex("search_group", (q) => q.search("group", search))
            .paginate(args.paginationOpts);

        case "problemType":
          return await ctx.db
            .query("customers")
            .withIndex("by_problemType", (q) => q.eq("problemType", search))
            .order("asc")
            .paginate(args.paginationOpts);
      }
    }

    return await ctx.db
      .query("customers")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
