"use client";

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
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {} from "@convex-dev/auth/server";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckIcon,
  FileCode2Icon,
  HourglassIcon,
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

  const isLoadingFirst = status === "LoadingFirstPage";
  const isLoadingMore = status === "LoadingMore";
  const canLoadMore = status === "CanLoadMore";

  return (
    <div className="container flex flex-col gap-6">
      <header>
        <h1 className="text-lg font-semibold">Invoice Analysis History</h1>
      </header>

      <section>
        {isLoadingFirst ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Spinner />
              </EmptyMedia>
              <EmptyTitle>Loading workflows...</EmptyTitle>
              <EmptyDescription>
                Please wait while we load your analysis workflows...
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : results.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileCode2Icon />
              </EmptyMedia>
              <EmptyTitle>No workflows</EmptyTitle>
              <EmptyDescription>Start by analyzing an invoice</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/">Analyze invoice</Link>
              </Button>
            </EmptyContent>
          </Empty>
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
                        <Link href={`/analysis-workflows/${workflow._id}`}>
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
                        <Link href={`/analysis-workflows/${workflow._id}`}>
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
                      <Link href={`/analysis-workflows/${workflow._id}`}>
                        {workflow.createdByUser?.name ??
                          workflow.createdByUser?.email}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/analysis-workflows/${workflow._id}`}>
                        {Number(workflow.filesCount).toLocaleString()}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/analysis-workflows/${workflow._id}`}>
                        <StatsCell analysisWorkflowHeaderId={workflow._id} />
                      </Link>
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
                        <Spinner />
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

const StatsCell = ({
  analysisWorkflowHeaderId,
}: {
  analysisWorkflowHeaderId: Id<"analysisWorkflowHeaders">;
}) => {
  const detailsQuery = useQuery(
    api.domains.analysisWorkflows.queries.getAnalysisWorkflowDetailsByHeaderId,
    {
      analysisWorkflowHeaderId: analysisWorkflowHeaderId,
    },
  );

  const isLoading = detailsQuery === undefined;

  return (
    <ItemGroup className="flex-row">
      {[
        {
          label: "Queued",
          value: Number(detailsQuery?.stats.queuedCount ?? 0).toLocaleString(),
          icon: HourglassIcon,
        },
        {
          label: "Processing",
          value: Number(
            detailsQuery?.stats.processingCount ?? 0,
          ).toLocaleString(),
          icon: LoaderIcon,
        },
        {
          label: "Success",
          value: Number(detailsQuery?.stats.successCount ?? 0).toLocaleString(),
          icon: CheckIcon,
        },
        {
          label: "Failed",
          value: Number(detailsQuery?.stats.failedCount ?? 0).toLocaleString(),
          icon: XIcon,
        },
      ].map((item) => (
        <Item
          key={item.label}
          size="sm"
          variant={isLoading ? "muted" : "default"}
          className={cn(isLoading && "animate-pulse")}
        >
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
