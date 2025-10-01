import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";

export const getCustomerByNumber = internalQuery({
  args: {
    number: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_number", (q) => q.eq("number", args.number))
      .first();
  },
});
