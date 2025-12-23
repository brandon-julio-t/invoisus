import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { RefreshCcwIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export function RetryButton({
  analysisWorkflowDetailId,
}: {
  analysisWorkflowDetailId: Id<"analysisWorkflowDetails">;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const retryOneAnalysisWorkflowDetail = useMutation(
    api.domains.analysisWorkflowDetails.mutations
      .retryOneAnalysisWorkflowDetail,
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isLoading}
      onClick={async () => {
        setIsLoading(true);

        await toast
          .promise(
            retryOneAnalysisWorkflowDetail({
              analysisWorkflowDetailId,
            }),
            {
              loading: "Retrying analysis workflow detail...",
              success: "Analysis workflow detail retried successfully",
              error: (err) =>
                err instanceof ConvexError
                  ? err.data
                  : "Failed to retry analysis workflow detail",
              finally: () => {
                setIsLoading(false);
              },
            },
          )
          .unwrap();
      }}
    >
      {isLoading ? <Spinner /> : <RefreshCcwIcon />}
    </Button>
  );
}
