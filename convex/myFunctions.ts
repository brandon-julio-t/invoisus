import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const handleEnqueueAiInvoiceAnalysis = mutation({
  args: {
    fileUrls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    //
    console.log(args);
  },
});
