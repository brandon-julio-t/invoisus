import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { authComponent, createAuth } from "../../auth";

export const createUser = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const { auth } = await authComponent.getAuth(createAuth, ctx);

    return await auth.api.signUpEmail({
      body: {
        name: args.name,
        email: args.email,
        password: args.password,
      },
    });
  },
});
