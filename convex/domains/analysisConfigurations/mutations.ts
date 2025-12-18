import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import { authComponent } from "../../auth";
import schema from "../../schema";

export const upsertAnalysisConfiguration = mutation({
  args: {
    id: v.optional(v.id("analysisConfigurations")),
    data: schema.tables.analysisConfigurations.validator,
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new ConvexError("User not found");
    }
    const userId = authUser._id as string;
    console.log("userId", userId);

    if (args.id) {
      await ctx.db.patch("analysisConfigurations", args.id, args.data);
    } else {
      await ctx.db.insert("analysisConfigurations", args.data);
    }
  },
});
