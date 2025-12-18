import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { authComponent } from "../../auth";
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

    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("User not found");
    }
    const userId = authUser._id as string;
    console.log("userId", userId);

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

    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("User not found");
    }
    const userId = authUser._id as string;
    console.log("userId", userId);

    for (const customer of args.customers) {
      console.log("customer", customer);

      const existingCustomer = await ctx.db
        .query("customers")
        .withIndex("by_number", (q) => q.eq("number", customer.number))
        .first();
      if (existingCustomer) {
        console.log(`Customer ${customer.number} already exists, updating...`);

        await updateOneCustomer({
          ctx,
          args: { id: existingCustomer._id, data: customer },
        });

        continue;
      }

      const id = await createOneCustomer({ ctx, args: customer });
      console.log(
        `Customer ${customer.number} does not exist, created with id ${id}`,
      );
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

    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("User not found");
    }
    const userId = authUser._id as string;
    console.log("userId", userId);

    await updateOneCustomer({ ctx, args });
  },
});

export const deleteCustomer = mutation({
  args: {
    id: v.id("customers"),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("User not found");
    }
    const userId = authUser._id as string;
    console.log("userId", userId);

    await deleteOneCustomer({ ctx, args });
  },
});
