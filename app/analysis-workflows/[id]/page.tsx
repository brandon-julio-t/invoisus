"use client";

import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/catalyst-ui/description-list";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
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
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { format, formatDistanceStrict } from "date-fns";
import {
  ArrowLeftIcon,
  CheckIcon,
  DownloadIcon,
  FileIcon,
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

  const workflowDetailsQuery = usePaginatedQuery(
    api.domains.analysisWorkflowDetails.queries.getAnalysisWorkflowDetails,
    {
      analysisWorkflowHeaderId: analysisWorkflowHeaderId,
    },
    {
      initialNumItems: 50,
    },
  );

  const onLoadMore = () => {
    if (workflowDetailsQuery.status === "CanLoadMore") {
      workflowDetailsQuery.loadMore(100);
    }
  };

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
      details: workflowDetailsQuery.results,
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
            details: workflowDetailsQuery.results,
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

  const totalFilesCount = workflowHeaderQuery.filesCount ?? 0;
  const successCount = workflowHeaderQuery.successCount ?? 0;
  const failedCount = workflowHeaderQuery.failedCount ?? 0;
  const processingCount = totalFilesCount - successCount - failedCount;

  return (
    <ItemGroup className="container gap-6">
      <section>
        <Button variant="ghost" asChild>
          <Link href="/analysis-workflows">
            <ArrowLeftIcon />
            Back to analysis workflows
          </Link>
        </Button>
      </section>

      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Workflow Overview</ItemTitle>
        </ItemContent>

        <ItemActions className="flex-wrap">
          <Button
            variant="outline"
            onClick={onExportExcel}
            disabled={
              workflowDetailsQuery.isLoading ||
              workflowDetailsQuery.results.length <= 0
            }
          >
            <FileIcon />
            Export to Excel
          </Button>

          <Button
            variant="outline"
            onClick={onDownloadAllFiles}
            disabled={
              workflowDetailsQuery.isLoading ||
              workflowDetailsQuery.results.length <= 0 ||
              isDownloading
            }
          >
            {isDownloading ? <Spinner /> : <DownloadIcon />}
            Download all Files
          </Button>
        </ItemActions>

        <ItemFooter>
          <DescriptionList className="w-full">
            <DescriptionTerm>Created By:</DescriptionTerm>
            <DescriptionDetails>
              {workflowHeaderQuery.createdByUser?.name ??
                workflowHeaderQuery.createdByUser?.email}
            </DescriptionDetails>

            <DescriptionTerm>Created At:</DescriptionTerm>
            <DescriptionDetails>
              {workflowHeaderQuery._creationTime
                ? format(workflowHeaderQuery._creationTime, "PPPPp")
                : "N/A"}
            </DescriptionDetails>

            <DescriptionTerm>Last Updated At:</DescriptionTerm>
            <DescriptionDetails>
              {workflowHeaderQuery.lastUpdatedTime
                ? format(workflowHeaderQuery.lastUpdatedTime, "PPPPp")
                : "N/A"}
            </DescriptionDetails>

            <DescriptionTerm>Duration:</DescriptionTerm>
            <DescriptionDetails>
              {workflowHeaderQuery.lastUpdatedTime
                ? formatDistanceStrict(
                    workflowHeaderQuery._creationTime ?? 0,
                    workflowHeaderQuery.lastUpdatedTime ?? 0,
                  )
                : "N/A"}
            </DescriptionDetails>

            <DescriptionTerm>Files Count:</DescriptionTerm>
            <DescriptionDetails>
              {workflowHeaderQuery.filesCount} files
            </DescriptionDetails>

            <DescriptionTerm>Workflow ID:</DescriptionTerm>
            <DescriptionDetails className="font-mono truncate">
              {workflowHeaderQuery._id}
            </DescriptionDetails>
          </DescriptionList>
        </ItemFooter>
      </Item>

      <ItemGroup className="flex-col md:flex-row md:flex-wrap gap-6">
        {[
          {
            label: "Processing",
            value: processingCount.toLocaleString(),
            icon: LoaderIcon,
          },
          {
            label: "Success",
            value: successCount.toLocaleString(),
            icon: CheckIcon,
          },
          {
            label: "Failed",
            value: failedCount.toLocaleString(),
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

      <Item className="p-0">
        <ItemContent className="w-full">
          <ItemTitle>Analysis Details</ItemTitle>
        </ItemContent>
        <ItemFooter className="w-full">
          <WorkflowDetailsTable details={workflowDetailsQuery.results} />
        </ItemFooter>
      </Item>
    </ItemGroup>
  );
};

export default WorkflowDetailPage;
