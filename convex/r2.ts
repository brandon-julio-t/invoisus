import { R2 } from "@convex-dev/r2";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const r2 = new R2(components.r2);

export const { generateUploadUrl, syncMetadata } = r2.clientApi({
  checkUpload: async (ctx, bucket) => {
    console.log("checkUpload", bucket);
    // const user = await userFromAuth(ctx);
    // ...validate that the user can upload to this bucket
  },
  onUpload: async (ctx, bucket, key) => {
    console.log("onUpload", bucket, key);
    // ...do something with the key
    // This technically runs in the `syncMetadata` mutation, as the upload
    // is performed from the client side. Will run if using the `useUploadFile`
    // hook, or if `syncMetadata` function is called directly. Runs after the
    // `checkUpload` callback.
  },
});

export const generateDownloadUrl = mutation({
  args: {
    key: v.string(),
    expiresIn: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const authUser = await authComponent.safeGetAuthUser(ctx);
    console.log("authUser", authUser);
    if (!authUser) {
      throw new Error("User not found");
    }
    const userId = authUser._id as string;
    console.log("userId", userId);

    return await r2.getUrl(args.key, { expiresIn: args.expiresIn });
  },
});

export const queryDownloadUrl = query({
  args: {
    key: v.string(),
    expiresIn: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const authUser = await authComponent.safeGetAuthUser(ctx);
    console.log("authUser", authUser);
    if (!authUser) {
      return null;
    }
    const userId = authUser._id as string;
    console.log("userId", userId);

    return await r2.getUrl(args.key, { expiresIn: args.expiresIn });
  },
});
