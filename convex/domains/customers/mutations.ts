import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import {
  createOneCustomer,
  deleteOneCustomer,
  updateOneCustomer,
} from "./logics";
import { vCustomer } from "./validators";

export const createCustomer = mutation({
  args: vCustomer,
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new Error("User not found");
    }

    const id = await createOneCustomer({ ctx, args });
    console.log("id", id);
  },
});

export const importCustomers = mutation({
  args: {
    customers: v.array(vCustomer),
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

      const id = await createOneCustomer({ ctx, args: customer });
      console.log("id", id);
    }
  },
});

export const updateCustomer = mutation({
  args: {
    id: v.id("customers"),
    data: vCustomer,
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new Error("User not found");
    }

    await updateOneCustomer({ ctx, args });
  },
});

export const deleteCustomer = mutation({
  args: {
    id: v.id("customers"),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new Error("User not found");
    }

    await deleteOneCustomer({ ctx, args });
  },
});
