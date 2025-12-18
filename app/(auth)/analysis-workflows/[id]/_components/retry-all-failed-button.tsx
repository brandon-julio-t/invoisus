import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { RefreshCcwIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export function RetryAllFailedButton({
  analysisWorkflowHeaderId,
}: {
  analysisWorkflowHeaderId: Id<"analysisWorkflowHeaders">;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const retryAllFailedAnalysisWorkflowDetails = useMutation(
    api.domains.analysisWorkflows.mutations
      .retryAllFailedAnalysisWorkflowDetails,
  );

  return (
    <Button
      variant="outline"
      disabled={isLoading}
      onClick={async () => {
        setIsLoading(true);

        await toast
          .promise(
            retryAllFailedAnalysisWorkflowDetails({
              analysisWorkflowHeaderId,
            }),
            {
              loading: "Retrying all failed analysis workflow details...",
              success:
                "Retry all failed analysis workflow details started successfully",
              error: (err) =>
                err instanceof ConvexError
                  ? err.data
                  : "Failed to retry all failed analysis workflow details",
              finally: () => {
                setIsLoading(false);
              },
            },
          )
          .unwrap();
      }}
    >
      {isLoading ? <Spinner /> : <RefreshCcwIcon />}
      Retry All Failed
    </Button>
  );
}
