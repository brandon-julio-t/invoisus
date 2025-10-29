import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "./_generated/api";

export const workflow = new WorkflowManager(components.workflow, {
  workpoolOptions: {
    retryActionsByDefault: true,
    maxParallelism: 15, // pay-as-you-go plan max is 16, so we set 15 for now. can up this number when we upgrade our plan.
  },
});
