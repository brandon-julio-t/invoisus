import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../../_generated/server";
import { paginationOptsValidator } from "convex/server";

export const listCustomers = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new Error("User not found");
    }

    return await ctx.db
      .query("customers")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
