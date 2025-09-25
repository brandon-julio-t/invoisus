"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { format } from "date-fns";
import { DownloadIcon, FolderArchiveIcon, Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { WorkflowDetailsTable } from "./_components/workflow-details-table";
import { downloadWorkflowDetailsFile } from "./_logics/download-workflow-details-file";
import { exportWorkflowDetailsToExcel } from "./_logics/export-workflow-details-to-excel";

const WorkflowDetailPage = () => {
  const params = useParams();
  const workflowId = params.id as string;

  const workflowData = useQuery(
    api.domains.analyzeInvoice.queries.getAnalysisWorkflowDetail,
    {
      analysisWorkflowHeaderId: workflowId as Id<"analysisWorkflowHeaders">,
    },
  );

  const onExportExcel = () => {
    if (!workflowData) {
      toast.error("Workflow details not found");
      return;
    }

    const toastId = toast.loading("Exporting to Excel...");
    exportWorkflowDetailsToExcel({ workflowData });
    toast.dismiss(toastId);
    toast.success("Excel file exported successfully");
  };

  const [isDownloading, startDownloading] = React.useTransition();
  const onDownloadFiles = () => {
    startDownloading(async () => {
      if (!workflowData) {
        toast.error("Workflow details not found");
        return;
      }

      await toast
        .promise(downloadWorkflowDetailsFile({ workflowData }), {
          loading: "Downloading files...",
          success: "Files downloaded successfully",
          error: "Failed to download files",
        })
        .unwrap();
    });
  };

  if (!workflowData) {
    return (
      <div className="container">
        <div className="text-center">Loading workflow details...</div>
      </div>
    );
  }

  const { header, details } = workflowData;

  const problemExistances = Array.from(
    new Set(details.map((detail) => detail.problemExistanceType)),
  ).toSorted();

  return (
    <div className="container flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Overview</CardTitle>

          <CardDescription>
            Created on {format(header._creationTime, "PPPPpppp")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <strong>Files Count:</strong> {header.filesCount}
            </div>
            <div>
              <strong>Workflow ID:</strong> {header._id}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-2 md:flex-row md:justify-end">
          <Button
            variant="outline"
            onClick={onExportExcel}
            disabled={details.length === 0}
          >
            <DownloadIcon />
            Export to Excel
          </Button>

          <Button
            variant="outline"
            onClick={onDownloadFiles}
            disabled={details.length === 0 || isDownloading}
          >
            {isDownloading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <FolderArchiveIcon />
            )}
            Download Files
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Details</CardTitle>
          <CardDescription>
            {details.length} file{details.length !== 1 ? "s" : ""} in this
            workflow
          </CardDescription>
        </CardHeader>

        <Separator />

        {problemExistances.length ? (
          <div className="flex flex-col gap-6">
            {problemExistances.map((problemExistance, index) => (
              <React.Fragment key={`${problemExistance}-${index}`}>
                <CardContent>
                  <h3 className="mb-4 text-lg font-medium capitalize">
                    {problemExistance}
                  </h3>
                  <WorkflowDetailsTable
                    details={details.filter(
                      (detail) =>
                        detail.problemExistanceType === problemExistance,
                    )}
                  />
                </CardContent>

                <Separator className="last:hidden" />
              </React.Fragment>
            ))}
          </div>
        ) : (
          <CardContent>
            <WorkflowDetailsTable details={details} />
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default WorkflowDetailPage;
