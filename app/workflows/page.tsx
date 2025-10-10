"use client";

import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import {} from "@convex-dev/auth/server";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckIcon,
  HourglassIcon,
  Loader2Icon,
  LoaderIcon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";

const ITEMS_PER_PAGE = 10;

const WorkflowListPage = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.domains.analysisWorkflows.queries.getPaginatedAnalysisWorkflowHeaders,
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
                  <TableHead>Workflow ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Files Count</TableHead>
                  <TableHead>Stats.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((workflow) => (
                  <TableRow key={workflow._id}>
                    <TableCell>
                      <Item className="-mx-4" asChild>
                        <Link href={`/workflows/${workflow._id}`}>
                          <ItemContent>
                            <ItemTitle className="font-mono">
                              {workflow._id}
                            </ItemTitle>
                          </ItemContent>
                        </Link>
                      </Item>
                    </TableCell>
                    <TableCell>
                      <Item className="-mx-4" asChild>
                        <Link href={`/workflows/${workflow._id}`}>
                          <ItemContent>
                            <ItemTitle>
                              {format(workflow._creationTime, "PPPp")}
                            </ItemTitle>
                            <ItemDescription>
                              {formatDistanceToNow(workflow._creationTime, {
                                addSuffix: true,
                              })}
                            </ItemDescription>
                          </ItemContent>
                        </Link>
                      </Item>
                    </TableCell>
                    <TableCell>
                      {workflow.createdByUser?.name ??
                        workflow.createdByUser?.email}
                    </TableCell>
                    <TableCell>
                      {Number(workflow.filesCount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatsTableCell workflow={workflow} />
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

const StatsTableCell = ({
  workflow,
}: {
  workflow: Doc<"analysisWorkflowHeaders">;
}) => {
  const workflowDetailsQuery = useQuery(
    api.domains.analysisWorkflows.queries.getAnalysisWorkflowDetailsByHeaderId,
    { analysisWorkflowHeaderId: workflow._id },
  );

  const isLoading = typeof workflowDetailsQuery === "undefined";

  return (
    <ItemGroup className="flex-row flex-nowrap gap-2">
      {[
        {
          label: "Queued",
          value: Number(
            workflowDetailsQuery?.stats.queuedCount ?? 0,
          ).toLocaleString(),
          icon: HourglassIcon,
        },
        {
          label: "Processing",
          value: Number(
            workflowDetailsQuery?.stats.processingCount ?? 0,
          ).toLocaleString(),
          icon: LoaderIcon,
        },
        {
          label: "Success",
          value: Number(
            workflowDetailsQuery?.stats.successCount ?? 0,
          ).toLocaleString(),
          icon: CheckIcon,
        },
        {
          label: "Failed",
          value: Number(
            workflowDetailsQuery?.stats.failedCount ?? 0,
          ).toLocaleString(),
          icon: XIcon,
        },
      ].map((item) => (
        <Item key={item.label} size="sm">
          <ItemMedia variant="icon">
            {isLoading ? <Spinner /> : <item.icon />}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{item.label}</ItemTitle>
            <ItemDescription>{item.value}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
};

export default WorkflowListPage;
