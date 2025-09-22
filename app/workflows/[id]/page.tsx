"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const WorkflowDetailPage = () => {
  const params = useParams();
  const workflowId = params.id as string;

  const workflowData = useQuery(
    api.domains.analyzeInvoice.queries.getAnalysisWorkflowDetail,
    {
      analysisWorkflowHeaderId: workflowId as Id<"analysisWorkflowHeaders">,
    },
  );

  if (!workflowData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading workflow details...</div>
      </div>
    );
  }

  const { header, details } = workflowData;

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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Overview</CardTitle>
          <CardDescription>
            Created on {new Date(header._creationTime).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Files Count:</strong> {header.filesCount}
            </div>
            <div>
              <strong>Workflow ID:</strong> {header._id}
            </div>
          </div>
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Analysis Result</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.map((detail) => (
                <TableRow key={detail._id}>
                  <TableCell className="font-medium">
                    {detail.fileName}
                  </TableCell>
                  <TableCell>{detail.fileType}</TableCell>
                  <TableCell>{formatFileSize(detail.fileSize)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(detail.status)}>
                      {detail.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {detail.analysisResult ? (
                      <Tooltip>
                        <TooltipTrigger className="truncate max-w-xs">
                          {detail.analysisResult}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p className="whitespace-pre-wrap">
                            {detail.analysisResult}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {detail.errorMessage ? (
                      <Tooltip>
                        <TooltipTrigger className="max-w-xs truncate text-destructive">
                          {detail.errorMessage}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p className="whitespace-pre-wrap">
                            {detail.errorMessage}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowDetailPage;
