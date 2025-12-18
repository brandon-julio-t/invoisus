import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { FileIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { exportWorkflowDetailsToExcel } from "../_logics/export-workflow-details-to-excel";

const SAFE_LOAD_MORE_ITEMS = 15_000; // convex upper limit is ~16K

export function ExportToExcelButton({
  analysisWorkflowHeaderId,
}: {
  analysisWorkflowHeaderId: Id<"analysisWorkflowHeaders">;
}) {
  const [isExporting, setIsExporting] = React.useState(false);

  const workflowDetailsQuery = usePaginatedQuery(
    api.domains.analysisWorkflowDetails.queries.getAnalysisWorkflowDetails,
    isExporting
      ? {
          analysisWorkflowHeaderId: analysisWorkflowHeaderId,
        }
      : "skip",
    {
      initialNumItems: SAFE_LOAD_MORE_ITEMS,
    },
  );

  const onExportExcel = React.useCallback(() => {
    if (workflowDetailsQuery.isLoading) {
      toast.info("Data is still loading. Please wait...");
      return;
    }

    if (!workflowDetailsQuery || workflowDetailsQuery.results.length <= 0) {
      toast.error("Workflow details not found");
      return;
    }

    exportWorkflowDetailsToExcel({
      analysisWorkflowHeaderId,
      details: workflowDetailsQuery.results,
    });

    toast.success("Excel file exported successfully");
  }, [analysisWorkflowHeaderId, workflowDetailsQuery]);

  React.useEffect(
    function queryAllThenExportWhenExhaustedEffect() {
      if (!isExporting) {
        console.log("Not exporting. Returning...");
        return;
      }

      if (workflowDetailsQuery.isLoading) {
        console.log("Data is still loading. Please wait...");
        return;
      }

      if (workflowDetailsQuery.status === "Exhausted") {
        console.log("Data is exhausted. Exporting...");
        setIsExporting(false);
        onExportExcel();
      } else if (workflowDetailsQuery.status === "CanLoadMore") {
        console.log("Can load more data. Loading more data...");
        workflowDetailsQuery.loadMore(SAFE_LOAD_MORE_ITEMS);
      }
    },
    [isExporting, onExportExcel, workflowDetailsQuery],
  );

  return (
    <Button
      variant="outline"
      onClick={() => {
        setIsExporting(true);
      }}
      disabled={isExporting}
    >
      {isExporting ? <Spinner /> : <FileIcon />}
      Export to Excel
    </Button>
  );
}
