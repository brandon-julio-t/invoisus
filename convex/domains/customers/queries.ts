import { getAuthUserId } from "@convex-dev/auth/server";
import type { PaginationResult } from "convex/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import { query } from "../../_generated/server";

export const getCustomersListPaginated = query({
  args: {
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new Error("User not found");
    }

    const { search } = args;
    if (search) {
      console.log("commencing best search algorithm");

      const isValidNumber = Number.isInteger(Number(search));
      if (isValidNumber) {
        console.log("search is a valid number, using number index");

        return await ctx.db
          .query("customers")
          // Number.gte is similar with String.startsWith
          .withIndex("by_number", (q) => q.gte("number", search))
          // but we need to sort the Number asc so that relevant results
          .order("asc")
          .paginate(args.paginationOpts);
      }

      console.log("search is not a valid number, using name and group indexes");

      const customersByName = await ctx.db
        .query("customers")
        .withSearchIndex("search_name", (q) => q.search("name", search))
        .take(10);

      const customersByGroup = await ctx.db
        .query("customers")
        .withSearchIndex("search_group", (q) => q.search("group", search))
        .take(10);

      const maybeMatchingCustomers = [
        // number filter has been handled above, if the search keyword is truly a number
        ...customersByName,
        ...customersByGroup,
        // problem type filter is nigh impossible to search because it's just a single character
      ];

      const addedCustomerIds = {} as Record<Id<"customers">, boolean>;

      const uniqueCustomers = maybeMatchingCustomers.filter((customer) => {
        if (addedCustomerIds[customer._id]) {
          return false;
        }
        addedCustomerIds[customer._id] = true;
        return true;
      });

      return {
        isDone: true,
        continueCursor: "",
        page: uniqueCustomers,
      } satisfies PaginationResult<Doc<"customers">>;
    }

    console.log("no search, using default query");

    return await ctx.db
      .query("customers")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
