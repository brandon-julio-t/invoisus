import { defineTable } from "convex/server";
import { v } from "convex/values";

export const customers = defineTable({
  /** alternative ID from S&F */
  number: v.string(),
  name: v.string(),
  group: v.string(),
  problemType: v.string(),
})
  .index("by_number", ["number"])
  .index("by_problemType", ["problemType"])
  .searchIndex("search_number", { searchField: "number" })
  .searchIndex("search_name", { searchField: "name" })
  .searchIndex("search_group", { searchField: "group" });
