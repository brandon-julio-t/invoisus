import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const importCustomers = mutation({
  args: {
    customers: v.array(
      v.object({
        number: v.string(),
        name: v.string(),
        group: v.string(),
        problemType: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new Error("User not found");
    }

    for (const customer of args.customers) {
      console.log("customer", customer);

      const existingCustomer = await ctx.db
        .query("customers")
        .withIndex("by_number", (q) => q.eq("number", customer.number))
        .first();
      if (existingCustomer) {
        console.log(
          `customer with number ${customer.number} already exists, skipping...`,
          existingCustomer,
        );
        continue;
      }

      const id = await ctx.db.insert("customers", customer);

      console.log("id", id);
    }
  },
});
