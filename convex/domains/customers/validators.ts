import { pick } from "convex-helpers";
import { v } from "convex/values";
import schema from "../../schema";

export const vCustomer = v.object(
  pick(schema.tables.customers.validator.fields, [
    "number",
    "name",
    "group",
    "problemType",
  ]),
);
