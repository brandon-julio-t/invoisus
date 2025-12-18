import { v } from "convex/values";
import { workflow } from "../..";
import { components, internal } from "../../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../../_generated/server";
import { authComponent, createAuth } from "../../auth";

export const getAllProcessingAnalysisWorkflowDetails = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("analysisWorkflowDetails")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .collect();
  },
});

export const stopAllProcessingWorkflows = internalAction({
  args: {
    areYouSure: v.literal("yes"),
  },
  handler: async (ctx, args) => {
    console.log(args);

    const analysisWorkflowDetails = await ctx.runQuery(
      internal.admin.console.dangerousFunctions
        .getAllProcessingAnalysisWorkflowDetails,
      {},
    );

    for (const analysisWorkflowDetail of analysisWorkflowDetails) {
      console.log(
        "cancelling analysis workflow detail:",
        analysisWorkflowDetail,
      );

      if (
        analysisWorkflowDetail.status === "failed" ||
        analysisWorkflowDetail.status === "success"
      ) {
        console.log(
          "skipping because it's already finished:",
          analysisWorkflowDetail,
        );
        continue;
      }

      await workflow
        .cancel(ctx, analysisWorkflowDetail.workflowId)
        .then((result) => {
          console.log(
            "cancelled analysis workflow detail:",
            analysisWorkflowDetail,
          );

          console.log("cancelled result:", result);
        })
        .catch((error) => {
          console.error("error cancelling analysis workflow detail:", error);
        });
    }
  },
});

export const migrateAllConvexAuthUsersToBetterAuth = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      console.log("migrating user", user);

      const jobId = await ctx.scheduler.runAfter(
        0,
        internal.admin.console.dangerousFunctions
          .migrateOneConvexAuthUserToBetterAuth,
        {
          userId: user._id,
        },
      );

      console.log("jobId", jobId);
    }
  },
});

export const migrateOneConvexAuthUserToBetterAuth = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const span = `migrateConvexAuthToBetterAuth-${args.userId}`;

    const convexAuthUser = await ctx.db.get("users", args.userId);
    console.log(span, "convexAuthUser", convexAuthUser);
    if (!convexAuthUser) {
      throw new Error("User not found");
    }

    console.log(span, "migrating user", convexAuthUser);

    const existingBetterAuthUser = await ctx.runQuery(
      components.betterAuth.functions.getUserByEmail,
      {
        email: convexAuthUser.email ?? "",
      },
    );

    if (existingBetterAuthUser) {
      console.log(span, "existingBetterAuthUser", existingBetterAuthUser);
      return;
    }

    const convexAuthAccount = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", convexAuthUser._id))
      .first();

    console.log(span, "convexAuthAccount", convexAuthAccount);

    const { auth } = await authComponent.getAuth(createAuth, ctx);

    const response = await auth.api.signUpEmail({
      body: {
        name: convexAuthUser.name ?? convexAuthUser.email ?? convexAuthUser._id,
        email: convexAuthUser.email ?? convexAuthUser._id,
        password: "TEMPORARY-PASSWORD",
      },
    });

    console.log(span, "response", response);

    const betterAuthUserId = response.user.id;

    console.log(span, "betterAuthUserId", betterAuthUserId);

    await ctx.runMutation(
      components.betterAuth.functions.updateHashedPassword,
      {
        userId: betterAuthUserId,
        password:
          convexAuthAccount?.secret ??
          convexAuthUser.email ??
          convexAuthUser._id,
      },
    );

    await ctx.db.patch("users", convexAuthUser._id, {
      externalId: betterAuthUserId,
    });

    console.log(span, "migrated user", convexAuthUser);
  },
});
