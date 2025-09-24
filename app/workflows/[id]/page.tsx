"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { WorkflowDetailsTable } from "./_components/workflow-details-table";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

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

  const problemExistances = Array.from(
    new Set(details.map((detail) => detail.problemExistanceType)),
  ).toSorted();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <section>
        <Button variant="outline" asChild>
          <Link href="/workflows">
            <ChevronLeftIcon />
            Back to Workflows
          </Link>
        </Button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Overview</CardTitle>
          <CardDescription>
            Created on {format(header._creationTime, "PPPPpppp")}
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

        <Separator />

        {problemExistances.length ? (
          <div className="flex flex-col gap-6">
            {problemExistances.map((problemExistance, index) => (
              <React.Fragment key={`${problemExistance}-${index}`}>
                <CardContent>
                  <h3 className="text-lg font-medium capitalize mb-4">
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
