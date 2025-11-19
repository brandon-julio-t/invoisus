import { query } from "../../_generated/server";

export const getAnalysisConfiguration = query({
  args: {
    //
  },
  handler: async (ctx) => {
    return await ctx.db.query("analysisConfigurations").first();
  },
});
