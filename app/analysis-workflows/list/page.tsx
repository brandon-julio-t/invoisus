"use client";

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
import {} from "@convex-dev/auth/server";
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowRightIcon,
  CheckIcon,
  FileCode2Icon,
  LoaderIcon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

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
                  <TableHead className="pl-6">Creation</TableHead>
                  <TableHead>Stats.</TableHead>
                  <TableHead className="w-1">&nbsp;</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((workflow) => {
                  const total = workflow.filesCount;
                  const successCount = workflow.successCount ?? 0;
                  const failedCount = workflow.failedCount ?? 0;
                  const processingCount = total - successCount - failedCount;

                  return (
                    <TableRow key={workflow._id}>
                      <TableCell>
                        <ItemContent>
                          <ItemTitle className="font-mono">
                            {workflow._id}
                          </ItemTitle>
                          <ItemDescription>
                            {Number(workflow.filesCount).toLocaleString()} files
                          </ItemDescription>
                        </ItemContent>
                      </TableCell>
                      <TableCell>
                        <Item>
                          <ItemContent>
                            <ItemTitle>
                              by{" "}
                              {workflow.createdByUser?.name ??
                                workflow.createdByUser?.email}
                            </ItemTitle>
                            <ItemDescription>
                              at {format(workflow._creationTime, "PPPp")}
                            </ItemDescription>
                            <ItemDescription>
                              around{" "}
                              {formatDistanceToNow(workflow._creationTime, {
                                addSuffix: true,
                              })}
                            </ItemDescription>
                          </ItemContent>
                        </Item>
                      </TableCell>
                      <TableCell>
                        <ItemGroup className="flex-row gap-2">
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
                              size="sm"
                              className="flex-nowrap"
                            >
                              <ItemContent className="w-24">
                                <ItemDescription>{item.label}</ItemDescription>
                                <ItemTitle>{item.value}</ItemTitle>
                              </ItemContent>
                              <ItemMedia variant="image">
                                <item.icon className="text-muted-foreground" />
                              </ItemMedia>
                            </Item>
                          ))}
                        </ItemGroup>
                      </TableCell>
                      <TableCell>
                        <Link href={`/analysis-workflows/${workflow._id}`}>
                          <Button variant="ghost" size="lg">
                            View Details
                            <ArrowRightIcon />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

export default WorkflowListPage;
