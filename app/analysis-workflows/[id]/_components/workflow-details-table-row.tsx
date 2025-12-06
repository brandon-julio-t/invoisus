"use client";

import { Response } from "@/components/ai-elements/response";
import { Badge } from "@/components/catalyst-ui/badge";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/catalyst-ui/description-list";
import { Button } from "@/components/ui/button";
import { ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
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
import { ChevronDownIcon, DownloadIcon, EyeIcon } from "lucide-react";
import React from "react";
import { DownloadFileButton } from "./download-file-button";
import { RetryButton } from "./retry-button";
import type { WorkflowDetailsType } from "./types";
import { ViewFileDialog } from "./view-file-dialog";

export const WorkflowDetailsTableRow = ({
  detail,
}: {
  detail: WorkflowDetailsType[number];
}) => {
  const [isRowExpanded, setIsRowExpanded] = React.useState(false);

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
          <ItemContent>
            <ItemTitle>{detail.fileName}</ItemTitle>
            <ItemDescription>
              {detail.fileType} &bull; {formatFileSize(detail.fileSize)}
            </ItemDescription>
          </ItemContent>
        </TableCell>
        <TableCell>
          <Badge
            color={getStatusBadgeColor(detail.status)}
            className="capitalize"
          >
            {detail.status === "queued" || detail.status === "processing" ? (
              <Spinner className="size-3" />
            ) : null}
            {detail.status}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge
            color={
              detail.problemExistanceType === "certainly has problem"
                ? "red"
                : "yellow"
            }
            className="capitalize"
          >
            {detail.problemExistanceType}
          </Badge>
        </TableCell>
        <TableCell>
          {detail.status === "failed" && (
            <RetryButton analysisWorkflowDetailId={detail._id} />
          )}

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
                    <DescriptionList>
                      {Object.entries(detail.dataExtractionResult).map(
                        ([key, value]) => (
                          <React.Fragment key={key}>
                            <DescriptionTerm>
                              {formatCamelCaseToHuman(key)}
                            </DescriptionTerm>
                            <DescriptionDetails className="whitespace-pre-wrap">
                              {value}
                            </DescriptionDetails>
                          </React.Fragment>
                        ),
                      )}
                    </DescriptionList>
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
                    <Response
                      className="[&_p]:whitespace-break-spaces"
                      mode="static"
                    >
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

const getStatusBadgeColor = (
  status: string,
): React.ComponentProps<typeof Badge>["color"] => {
  switch (status) {
    case "success":
      return "green";
    case "failed":
      return "red";
    case "processing":
      return "yellow";
    case "queued":
      return "yellow";
    default:
      return "zinc";
  }
};
