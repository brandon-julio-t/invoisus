"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { ChevronDownIcon } from "lucide-react";
import React from "react";

export const WorkflowDetailsTable = ({
  details,
}: {
  details: FunctionReturnType<
    typeof api.domains.analyzeInvoice.queries.getAnalysisWorkflowDetail
  >["details"];
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1">{/* expand row */}</TableHead>
          <TableHead>File Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Workflow Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {details.map((detail) => (
          <Collapsible key={detail._id} asChild>
            <React.Fragment>
              <TableRow>
                <TableCell>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="group">
                      <ChevronDownIcon className="group-data-[state=open]:rotate-180 transition-transform duration-200" />
                    </Button>
                  </CollapsibleTrigger>
                </TableCell>
                <TableCell className="font-medium">{detail.fileName}</TableCell>
                <TableCell>{detail.fileType}</TableCell>
                <TableCell>{formatFileSize(detail.fileSize)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(detail.status)}>
                    {detail.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {detail.workflowStatus === null ? (
                    <small className="text-muted-foreground">
                      done & cleaned up
                    </small>
                  ) : (
                    <>
                      {detail.workflowStatus?.inProgress ? (
                        <Badge variant="secondary">In Progress</Badge>
                      ) : (
                        <Badge variant="default">Completed</Badge>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>

              <CollapsibleContent asChild>
                <TableRow className="hover:bg-background">
                  <TableCell colSpan={6}>
                    <div className="flex flex-col gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">
                          Data Extraction Result
                        </h4>
                        <div className="text-sm">
                          {detail.dataExtractionResult ? (
                            <div className="bg-background overflow-hidden rounded-md border">
                              <Table>
                                <TableBody>
                                  {Object.entries(
                                    detail.dataExtractionResult,
                                  ).map(([key, value]) => (
                                    <TableRow
                                      key={key}
                                      className="*:border-border hover:bg-background [&>:not(:last-child)]:border-r"
                                    >
                                      <TableCell className="bg-muted/50 py-2 font-medium w-1/3">
                                        {formatKeyLabel(key)}
                                      </TableCell>
                                      <TableCell className="py-2">
                                        {value}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              No data extraction result available
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">Analysis Result</h4>
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

                      {detail.errorMessage && (
                        <>
                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-2 text-destructive">
                              Error
                            </h4>
                            <div className="text-sm">
                              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <p className="whitespace-pre-wrap text-destructive">
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
              </CollapsibleContent>
            </React.Fragment>
          </Collapsible>
        ))}
      </TableBody>
    </Table>
  );
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "success":
      return "default";
    case "failed":
      return "destructive";
    case "processing":
      return "secondary";
    case "queued":
      return "outline";
    default:
      return "outline";
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatKeyLabel = (key: string) => {
  // Convert camelCase to human readable format
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};
