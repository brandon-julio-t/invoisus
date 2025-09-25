"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TableCell, TableRow } from "@/components/ui/table";
import { triggerBrowserDownloadFileFromUrl } from "@/lib/file-download";
import { formatCamelCaseToHuman, formatFileSize } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CheckIcon,
  ChevronDownIcon,
  DownloadIcon,
  HourglassIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { WorkflowDetailsType } from "./types";
import {
  Data,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "@/components/data";

export const WorkflowDetailsTableRow = ({
  detail,
}: {
  detail: WorkflowDetailsType[number];
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const internalWorkflowStatus = detail.internalWorkflowStatus;
  const inProgress = internalWorkflowStatus?.inProgress ?? [];

  const [isDownloading, startDownloading] = React.useTransition();
  const onDownloadFile = () => {
    startDownloading(async () => {
      await toast
        .promise(
          triggerBrowserDownloadFileFromUrl({
            url: detail.fileDownloadUrl,
            filename: detail.fileName,
          }),
          {
            loading: `Downloading file ${detail.fileName}...`,
            success: `File ${detail.fileName} downloaded successfully`,
            error: `Failed to download file ${detail.fileName}`,
          },
        )
        .unwrap();
    });
  };
  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDownIcon
              className={cn(
                "transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </Button>
        </TableCell>
        <TableCell>
          <div className="max-w-xs truncate font-medium">{detail.fileName}</div>
        </TableCell>
        <TableCell>{detail.fileType}</TableCell>
        <TableCell>{formatFileSize(detail.fileSize)}</TableCell>
        <TableCell>
          <Badge
            variant={getStatusBadgeVariant(detail.status)}
            className="capitalize"
          >
            {detail.status === "queued" && <HourglassIcon />}

            {detail.status === "processing" && (
              <Loader2Icon className="animate-spin" />
            )}

            {detail.status === "success" && <CheckIcon />}

            {detail.status === "failed" && <XIcon />}

            {detail.status}
          </Badge>
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownloadFile}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <DownloadIcon />
            )}
          </Button>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="hover:bg-background">
          <TableCell colSpan={6}>
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="mb-2 text-base font-semibold">
                  Data Extraction Result
                </h4>
                <div className="text-sm">
                  {detail.dataExtractionResult ? (
                    <Data>
                      {Object.entries(detail.dataExtractionResult).map(
                        ([key, value]) => (
                          <DataItem key={key}>
                            <DataItemLabel>
                              {formatCamelCaseToHuman(key)}
                            </DataItemLabel>
                            <DataItemValue>{value}</DataItemValue>
                          </DataItem>
                        ),
                      )}
                    </Data>
                  ) : (
                    <p className="text-muted-foreground">
                      No data extraction result available
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-base font-semibold">
                  Analysis Result
                </h4>
                <div className="text-sm">
                  {detail.analysisResult ? (
                    <p className="whitespace-pre-wrap">
                      {detail.analysisResult}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      No analysis result available
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-base font-semibold">
                  Currently Running
                </h4>
                <div className="text-sm">
                  {inProgress.length > 0 ? (
                    <div className="space-y-2">
                      {inProgress.map((step) => (
                        <div
                          key={step._id}
                          className="bg-muted/50 flex items-center gap-2 rounded-md p-2"
                        >
                          <Loader2Icon className="size-(--text-sm) animate-spin" />
                          <div className="flex-1">
                            <div className="font-medium">{step.step.name}</div>
                            <div className="text-muted-foreground text-xs">
                              {step.step.functionType} • Started{" "}
                              {format(step._creationTime, "PPPPpppp")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No steps currently running
                    </p>
                  )}
                </div>
              </div>

              {detail.errorMessage && (
                <>
                  <Separator />

                  <div>
                    <h4 className="text-destructive mb-2 text-base font-semibold">
                      Error
                    </h4>
                    <div className="text-sm">
                      <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
                        <p className="text-destructive whitespace-pre-wrap">
                          {detail.errorMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "success":
      return "success";
    case "failed":
      return "destructive";
    case "processing":
      return "warning";
    case "queued":
      return "warning";
    default:
      return "outline";
  }
};
