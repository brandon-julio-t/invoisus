import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserById = query({
  args: {
    id: v.id("user"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get("user", args.id);
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user")
      .withIndex("email_name", (q) => q.eq("email", args.email))
      .first();
  },
});

export const updateHashedPassword = mutation({
  args: {
    userId: v.id("user"),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("account")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!account) {
      throw new Error("Account not found");
    }

    return await ctx.db.patch("account", account._id, {
      password: args.password,
    });
  },
});

// export const createBetterAuthUserFromConvexAuthUser = mutation({
//   args: {
//     name: v.string(),
//     email: v.string(),
//     password: v.string(),
//   },
//   handler: async (ctx, args) => {
//     console.log("args", args);

//     const { auth } = await authComponent.getAuth(createAuth, ctx);

//     console.log("auth", auth);

//     const response = await auth.api.signUpEmail({
//       body: {
//         name: args.name,
//         email: args.email,
//         password: args.password,
//       },
//     });

//     console.log("response", response);

//     const betterAuthUserId = response.user.id;

//     console.log("betterAuthUserId", betterAuthUserId);

//     const account = await ctx.db
//       .query("account")
//       .withIndex("userId", (q) => q.eq("userId", betterAuthUserId))
//       .first();

//     console.log("account", account);

//     if (account) {
//       await ctx.db.patch("account", account._id, {
//         password: args.password,
//       });
//     }

//     return betterAuthUserId;
//   },
// });
