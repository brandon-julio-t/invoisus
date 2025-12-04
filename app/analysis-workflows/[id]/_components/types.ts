import type { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type WorkflowDetailsType = FunctionReturnType<
  typeof api.domains.analysisWorkflowDetails.queries.getAnalysisWorkflowDetails
>["page"];
