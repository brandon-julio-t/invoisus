"use node";

import { Tool, tool } from "ai";
import { z } from "zod";
import { internal } from "../../_generated/api";
import { ActionCtx } from "../../_generated/server";

export const getCustomerByNumber = (ctx: ActionCtx): Tool => {
  return tool({
    description: `
Get customer by number.
Use this tool to identify the customer data.
The most important data is the problem type, which you MUST identify first before analyzing the invoice.
`.trim(),
    inputSchema: z.object({
      number: z.string(),
    }),
    execute: async (args) => {
      console.log("getCustomerByNumber", "args", args);

      const data = await ctx.runQuery(
        internal.domains.customers.internalQueries.getCustomerByNumber,
        args,
      );

      let message = "";
      if (!data) {
        message = `
Customer not found, please read the labels and values again carefully, then try again with a different and corrected customer number.
You MUST keep doing this until you find the correct customer number.
`.trim();
      } else {
        message = `
Customer found, please triple-check the customer data with your invoice.
Should the data differ, you MUST try again with a different and corrected customer number.
`.trim();
      }

      console.log("getCustomerByNumber", "data", data);
      console.log("getCustomerByNumber", "message", message);

      return {
        data,
        message,
      };
    },
  });
};
