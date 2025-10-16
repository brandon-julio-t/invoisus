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

export const searchCustomerByName = internalQuery({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withSearchIndex("search_name", (q) => q.search("name", args.name))
      .first();
  },
});

export const searchCustomerByGroup = internalQuery({
  args: {
    group: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withSearchIndex("search_group", (q) => q.search("group", args.group))
      .first();
  },
});
