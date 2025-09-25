"use client";

import {
  Data,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "@/components/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { format } from "date-fns";
import { DownloadIcon, FileIcon, Loader2Icon } from "lucide-react";
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
  const isProcessing = details.some((detail) => detail.status === "processing");

  const problemExistances = Array.from(
    new Set(details.map((detail) => detail.problemExistanceType)),
  ).toSorted();

  return (
    <div className="container flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 @md:flex-row">
            <header className="flex flex-1 flex-col gap-1.5">
              <CardTitle>Workflow Overview</CardTitle>

              <CardDescription>
                Created on {format(header._creationTime, "PPPPpppp")}
              </CardDescription>
            </header>

            <div className="flex flex-col gap-2 @md:flex-row">
              <Button
                variant="outline"
                onClick={onExportExcel}
                disabled={details.length === 0 || isProcessing}
              >
                <FileIcon />
                Export to Excel
              </Button>

              <Button
                variant="outline"
                onClick={onDownloadFiles}
                disabled={details.length === 0 || isDownloading || isProcessing}
              >
                {isDownloading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <DownloadIcon />
                )}
                Download all Files
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Data>
            {[
              {
                label: "Model Preset:",
                value: header.modelPreset,
              },
              {
                label: "Files Count:",
                value: header.filesCount,
              },
              {
                label: "Workflow ID:",
                value: header._id,
              },
            ].map((item) => (
              <DataItem key={item.label}>
                <DataItemLabel>{item.label}</DataItemLabel>
                <DataItemValue>{item.value}</DataItemValue>
              </DataItem>
            ))}
          </Data>
        </CardContent>
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
            {problemExistances.map((problemExistance, index) => {
              return (
                <React.Fragment key={`${problemExistance}-${index}`}>
                  <CardContent>
                    <header className="mb-4 flex flex-row items-center gap-2 text-lg font-medium capitalize">
                      <div
                        className={cn(
                          "size-(--text-sm) rounded-full",
                          problemExistance === "certainly has problem" &&
                            "bg-destructive/80",
                          problemExistance === "not certain" && "bg-warning/80",
                        )}
                      />
                      <h3 className="">{problemExistance}</h3>
                    </header>

                    <WorkflowDetailsTable
                      details={details.filter(
                        (detail) =>
                          detail.problemExistanceType === problemExistance,
                      )}
                    />
                  </CardContent>

                  <Separator className="last:hidden" />
                </React.Fragment>
              );
            })}
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
