import type { Infer } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import type { vCustomer } from "./validators";

export async function createOneCustomer({
  ctx,
  args,
}: {
  ctx: MutationCtx;
  args: Infer<typeof vCustomer>;
}) {
  return await ctx.db.insert("customers", args);
}

export async function updateOneCustomer({
  ctx,
  args,
}: {
  ctx: MutationCtx;
  args: {
    id: Id<"customers">;
    data: Infer<typeof vCustomer>;
  };
}) {
  return await ctx.db.patch("customers", args.id, args.data);
}

export async function deleteOneCustomer({
  ctx,
  args,
}: {
  ctx: MutationCtx;
  args: {
    id: Id<"customers">;
  };
}) {
  return await ctx.db.delete("customers", args.id);
}
