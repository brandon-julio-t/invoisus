"use client";

import {
  Data,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "@/components/data";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  CheckIcon,
  DownloadIcon,
  FileIcon,
  HourglassIcon,
  LoaderIcon,
  TelescopeIcon,
  XIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { WorkflowDetailsTable } from "./_components/workflow-details-table";
import { downloadWorkflowDetailsFile } from "./_logics/download-workflow-details-file";
import { exportWorkflowDetailsToExcel } from "./_logics/export-workflow-details-to-excel";

const WorkflowDetailPage = () => {
  const params = useParams();
  const analysisWorkflowHeaderId = params.id as Id<"analysisWorkflowHeaders">;

  const workflowHeaderQuery = useQuery(
    api.domains.analysisWorkflows.queries.getAnalysisWorkflowHeaderById,
    { id: analysisWorkflowHeaderId },
  );

  const workflowDetailsQuery = useQuery(
    api.domains.analysisWorkflows.queries.getAnalysisWorkflowDetailsByHeaderId,
    { analysisWorkflowHeaderId: analysisWorkflowHeaderId },
  );

  const onExportExcel = () => {
    if (!workflowHeaderQuery) {
      toast.error("Workflow header not found");
      return;
    }

    if (!workflowDetailsQuery) {
      toast.error("Workflow details not found");
      return;
    }

    const toastId = toast.loading("Exporting to Excel...");
    exportWorkflowDetailsToExcel({
      header: workflowHeaderQuery,
      details: workflowDetailsQuery.data,
    });
    toast.dismiss(toastId);
    toast.success("Excel file exported successfully");
  };

  const generateDownloadUrl = useMutation(api.r2.generateDownloadUrl);

  const [isDownloading, startDownloading] = React.useTransition();
  const onDownloadAllFiles = () => {
    startDownloading(async () => {
      if (!workflowHeaderQuery) {
        toast.error("Workflow header not found");
        return;
      }

      if (!workflowDetailsQuery) {
        toast.error("Workflow details not found");
        return;
      }

      await toast
        .promise(
          downloadWorkflowDetailsFile({
            header: workflowHeaderQuery,
            details: workflowDetailsQuery.data,
            generateDownloadUrl,
          }),
          {
            loading: "Downloading files...",
            success: "Files downloaded successfully",
            error: "Failed to download files",
          },
        )
        .unwrap();
    });
  };

  if (workflowHeaderQuery === undefined || workflowDetailsQuery === undefined) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>Loading analysis workflow data...</EmptyTitle>
          <EmptyDescription>
            Please wait while we load the analysis workflow data...
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (workflowHeaderQuery === null || workflowDetailsQuery === null) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TelescopeIcon />
          </EmptyMedia>
          <EmptyTitle>Analysis workflow data not found</EmptyTitle>
          <EmptyDescription>
            The analysis workflow data for this ID was not found.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/analysis-workflows">
              Back to analysis workflows list
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const isProcessing = workflowDetailsQuery.stats.processingCount > 0;

  const problemExistances = Array.from(
    new Set(
      workflowDetailsQuery.data.map((detail) => detail.problemExistanceType),
    ),
  ).toSorted();

  return (
    <div className="container flex flex-col gap-6">
      <section>
        <Button variant="ghost" className="-mx-4" asChild>
          <Link href="/analysis-workflows">
            <ArrowLeftIcon />
            Back to analysis workflows
          </Link>
        </Button>
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 @md:flex-row">
            <header className="flex flex-1 flex-col gap-1.5">
              <CardTitle>Workflow Overview</CardTitle>

              <CardDescription>
                Created on{" "}
                {format(workflowHeaderQuery._creationTime ?? 0, "PPPPpppp")}
              </CardDescription>
            </header>

            <div className="flex flex-col gap-2 @md:flex-row">
              <Button
                variant="outline"
                onClick={onExportExcel}
                disabled={
                  workflowDetailsQuery.data.length === 0 || isProcessing
                }
              >
                <FileIcon />
                Export to Excel
              </Button>

              <Button
                variant="outline"
                onClick={onDownloadAllFiles}
                disabled={
                  workflowDetailsQuery.data.length === 0 || isDownloading
                }
              >
                {isDownloading ? <Spinner /> : <DownloadIcon />}
                Download all Files
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Data>
            {[
              {
                label: "Created By:",
                value:
                  workflowHeaderQuery.createdByUser?.name ??
                  workflowHeaderQuery.createdByUser?.email,
              },
              {
                label: "Files Count:",
                value: workflowHeaderQuery.filesCount,
              },
              {
                label: "Workflow ID:",
                value: workflowHeaderQuery._id,
              },
            ].map((item) => (
              <DataItem key={item.label}>
                <DataItemLabel>{item.label}</DataItemLabel>
                <DataItemValue className="truncate">{item.value}</DataItemValue>
              </DataItem>
            ))}
          </Data>
        </CardContent>
      </Card>

      <ItemGroup className="flex-row flex-wrap gap-2">
        {[
          {
            label: "Queued",
            value: Number(
              workflowDetailsQuery.stats.queuedCount,
            ).toLocaleString(),
            icon: HourglassIcon,
          },
          {
            label: "Processing",
            value: Number(
              workflowDetailsQuery.stats.processingCount,
            ).toLocaleString(),
            icon: LoaderIcon,
          },
          {
            label: "Success",
            value: Number(
              workflowDetailsQuery.stats.successCount,
            ).toLocaleString(),
            icon: CheckIcon,
          },
          {
            label: "Failed",
            value: Number(
              workflowDetailsQuery.stats.failedCount,
            ).toLocaleString(),
            icon: XIcon,
          },
        ].map((item) => (
          <Item
            key={item.label}
            variant="outline"
            className="flex-1 flex-nowrap"
          >
            <ItemMedia variant="icon">
              <item.icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{item.label}</ItemTitle>
              <ItemDescription>{item.value}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Details</CardTitle>
          <CardDescription>
            {workflowDetailsQuery.data.length} file
            {workflowDetailsQuery.data.length !== 1 ? "s" : ""} in this workflow
          </CardDescription>
        </CardHeader>

        <Separator />

        {problemExistances.length ? (
          <div className="flex flex-col gap-6">
            {problemExistances.map((problemExistance, index) => {
              const details = workflowDetailsQuery.data.filter(
                (detail) => detail.problemExistanceType === problemExistance,
              );

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
                      <h3>
                        {problemExistance ?? "Uncategorized"} (
                        {Number(details.length).toLocaleString()})
                      </h3>
                    </header>

                    <WorkflowDetailsTable details={details} />
                  </CardContent>

                  <Separator className="last:hidden" />
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <CardContent>
            <WorkflowDetailsTable details={workflowDetailsQuery.data} />
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default WorkflowDetailPage;
