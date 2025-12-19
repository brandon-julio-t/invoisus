import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { authComponent } from "../../auth";

export async function getUserByBetterAuth({
  ctx,
}: {
  ctx: QueryCtx | MutationCtx;
}) {
  const span = "getUserByBetterAuth";

  const authUser = await authComponent.safeGetAuthUser(ctx);
  console.log(span, "authUser", authUser);
  if (!authUser) {
    return null;
  }

  const externalId = authUser._id;
  console.log(span, "externalId", externalId);

  return await ctx.db
    .query("users")
    .withIndex("externalId", (q) => q.eq("externalId", externalId))
    .first();
}
