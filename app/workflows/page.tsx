"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { format } from "date-fns";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import Link from "@/components/link";

const ITEMS_PER_PAGE = 10;

const WorkflowListPage = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.domains.analyzeInvoice.queries.getPaginatedAnalysisWorkflowHeaders,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );

  const isLoadingMore = status === "LoadingMore";
  const canLoadMore = status === "CanLoadMore";

  return (
    <div className="container flex flex-col gap-6">
      <header>
        <h1 className="text-lg font-semibold">Invoice Analysis History</h1>
      </header>

      <section>
        {results.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No workflows found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Model Preset</TableHead>
                  <TableHead>Workflow ID</TableHead>
                  <TableHead>Files Count</TableHead>
                  <TableHead className="w-1">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((workflow) => (
                  <TableRow key={workflow._id}>
                    <TableCell className="font-medium">
                      {format(workflow._creationTime, "PPPPpppp")}
                    </TableCell>
                    <TableCell>{workflow.modelPreset}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {workflow._id}
                    </TableCell>
                    <TableCell>
                      {Number(workflow.filesCount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" asChild>
                        <Link href={`/workflows/${workflow._id}`}>
                          View Details
                          <ArrowRightIcon />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {canLoadMore && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => loadMore(ITEMS_PER_PAGE)}
                  disabled={isLoadingMore}
                  variant="outline"
                  asChild
                >
                  <motion.button
                    onViewportEnter={() => loadMore(ITEMS_PER_PAGE)}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </motion.button>
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default WorkflowListPage;
