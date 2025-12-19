import type { AuthFunctions } from "@convex-dev/better-auth";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { Resend } from "resend";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import { PasswordResetEmail } from "./auth/passwordReset";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL!;

const authFunctions: AuthFunctions = internal.auth;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
    verbose: process.env.NODE_ENV === "development",
    authFunctions,
    triggers: {
      user: {
        onCreate: async (ctx, doc) => {
          await ctx.db.insert("users", {
            name: doc.name,
            email: doc.email,
            image: doc.image ?? undefined,
            externalId: doc._id,
          });
        },
        onUpdate: async (ctx, newDoc) => {
          const localUser = await ctx.db
            .query("users")
            .withIndex("externalId", (q) => q.eq("externalId", newDoc._id))
            .first();

          if (localUser) {
            await ctx.db.patch("users", localUser._id, {
              name: newDoc.name,
              email: newDoc.email,
              image: newDoc.image ?? undefined,
            });
          } else {
            await ctx.db.insert("users", {
              name: newDoc.name,
              email: newDoc.email,
              image: newDoc.image ?? undefined,
              externalId: newDoc._id,
            });
          }
        },
        onDelete: async (ctx, doc) => {
          const localUser = await ctx.db
            .query("users")
            .withIndex("externalId", (q) => q.eq("externalId", doc._id))
            .first();

          if (localUser) {
            await ctx.db.delete("users", localUser._id);
          }
        },
      },
    },
  },
);

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url, token }) => {
        const resend = new Resend(process.env.RESEND_API_KEY!);

        await resend.emails.send({
          from: "Invoisus <notify@noreply.farmio.io>",
          to: [user.email],
          subject: "Reset password in Invoisus",
          react: PasswordResetEmail({ code: token, url }),
        });
      },
    },
    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};

export const getAuthUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});
