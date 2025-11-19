import { createAccount } from "@convex-dev/auth/server";
import { internalAction } from "../../_generated/server";
import { v } from "convex/values";

export const createUser = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await createAccount(ctx, {
      provider: "password",
      account: {
        id: args.email,
        secret: args.password,
      },
      profile: {
        name: args.name,
        email: args.email,
      },
    });

    return result;
  },
});
