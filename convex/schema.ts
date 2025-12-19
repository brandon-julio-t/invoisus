import { defineSchema } from "convex/server";
import { analysisConfigurations } from "./tables/analysisConfigurations";
import { analysisWorkflowDetails } from "./tables/analysisWorkflowDetails";
import { analysisWorkflowHeaders } from "./tables/analysisWorkflowHeaders";
import { customers } from "./tables/customers";
import { users } from "./tables/users";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users,
  customers,
  analysisConfigurations,
  analysisWorkflowHeaders,
  analysisWorkflowDetails,
});
