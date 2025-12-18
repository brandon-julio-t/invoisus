import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import schema from "../../schema";

export const upsertAnalysisConfiguration = mutation({
  args: {
    id: v.optional(v.id("analysisConfigurations")),
    data: schema.tables.analysisConfigurations.validator,
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);
    if (!userId) {
      throw new ConvexError("User not found");
    }

    if (args.id) {
      await ctx.db.patch("analysisConfigurations", args.id, args.data);
    } else {
      await ctx.db.insert("analysisConfigurations", args.data);
    }
  },
});
