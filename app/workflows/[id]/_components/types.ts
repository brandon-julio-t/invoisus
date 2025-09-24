import { api } from "@/convex/_generated/api";
import { FunctionReturnType } from "convex/server";

export type WorkflowDetailsType = FunctionReturnType<
  typeof api.domains.analyzeInvoice.queries.getAnalysisWorkflowDetail
>["details"];
