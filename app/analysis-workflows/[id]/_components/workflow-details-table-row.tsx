"use client";

import { Response } from "@/components/ai-elements/response";
import {
  Data,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "@/components/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCamelCaseToHuman, formatFileSize } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckIcon,
  ChevronDownIcon,
  DownloadIcon,
  EyeIcon,
  HourglassIcon,
  XIcon,
} from "lucide-react";
import React from "react";
import { DownloadFileButton } from "./download-file-button";
import { WorkflowDetailsType } from "./types";
import { ViewFileDialog } from "./view-file-dialog";

export const WorkflowDetailsTableRow = ({
  detail,
}: {
  detail: WorkflowDetailsType[number];
}) => {
  const [isRowExpanded, setIsRowExpanded] = React.useState(false);

  const internalWorkflowStatus = detail.internalWorkflowStatus;
  const inProgress = internalWorkflowStatus?.inProgress ?? [];

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRowExpanded(!isRowExpanded)}
              >
                <ChevronDownIcon
                  className={cn(
                    "transition-transform duration-200",
                    isRowExpanded && "rotate-180",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isRowExpanded ? "Collapse details" : "Expand details"}
            </TooltipContent>
          </Tooltip>
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

            {detail.status === "processing" && <Spinner />}

            {detail.status === "success" && <CheckIcon />}

            {detail.status === "failed" && <XIcon />}

            {detail.status}
          </Badge>
        </TableCell>
        <TableCell>
          <ViewFileDialog fileKey={detail.fileKey} filename={detail.fileName}>
            <Button variant="ghost" size="icon">
              <EyeIcon />
            </Button>
          </ViewFileDialog>

          <Tooltip>
            <TooltipTrigger asChild>
              <DownloadFileButton
                fileKey={detail.fileKey}
                filename={detail.fileName}
                variant="ghost"
                size="icon"
              >
                {({ isDownloading }) =>
                  isDownloading ? <Spinner /> : <DownloadIcon />
                }
              </DownloadFileButton>
            </TooltipTrigger>
            <TooltipContent>Download file</TooltipContent>
          </Tooltip>
        </TableCell>
      </TableRow>

      {isRowExpanded && (
        <TableRow className="hover:bg-background">
          <TableCell colSpan={6}>
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="mb-2 text-base font-semibold">
                  Data Extraction Result
                </h4>

                <div>
                  {detail.dataExtractionResult ? (
                    <Data>
                      {Object.entries(detail.dataExtractionResult).map(
                        ([key, value]) => (
                          <DataItem key={key}>
                            <DataItemLabel>
                              {formatCamelCaseToHuman(key)}
                            </DataItemLabel>
                            <DataItemValue className="whitespace-pre-wrap">
                              {value}
                            </DataItemValue>
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
                    <Response className="[&_p]:whitespace-break-spaces">
                      {detail.analysisResult}
                    </Response>
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
                          <Spinner className="size-(--text-sm)" />
                          <div className="flex-1">
                            <div className="font-medium">{step.step.name}</div>
                            <div className="text-muted-foreground text-xs">
                              {step.step.functionType} • Started{" "}
                              {format(step._creationTime, "PPPPpppp")} •{" "}
                              {formatDistanceToNow(step._creationTime, {
                                addSuffix: true,
                              })}
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
