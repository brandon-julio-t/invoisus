import { internalQuery } from "../../_generated/server";

export const getAnalysisConfiguration = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("analysisConfigurations").first();
  },
});
