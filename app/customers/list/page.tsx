"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { Loader2Icon, UploadIcon } from "lucide-react";
import Link from "@/components/link";
import { motion } from "motion/react";

const ITEMS_PER_PAGE = 20;

const TableSkeletonRow = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-32" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
  </TableRow>
);

const CustomersListPage = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.domains.customers.queries.listCustomers,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );

  const isLoadingMore = status === "LoadingMore";
  const canLoadMore = status === "CanLoadMore";
  const isLoadingFirstPage = status === "LoadingFirstPage";

  const onLoadMore = () => {
    if (canLoadMore) {
      loadMore(ITEMS_PER_PAGE);
    }
  };

  return (
    <div className="container flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Customers</h1>
        <Button variant="outline" asChild>
          <Link href="/customers/import">
            <UploadIcon className="mr-2 h-4 w-4" />
            Import Customers
          </Link>
        </Button>
      </header>

      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Problem Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingFirstPage ? (
              <>
                <TableSkeletonRow />
                <TableSkeletonRow />
                <TableSkeletonRow />
                <TableSkeletonRow />
                <TableSkeletonRow />
              </>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  <p className="text-muted-foreground">No customers found</p>
                </TableCell>
              </TableRow>
            ) : (
              results.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell className="font-mono text-sm">
                    {customer.number}
                  </TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.group}</TableCell>
                  <TableCell>{customer.problemType}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore || !canLoadMore}
            variant="outline"
            asChild
          >
            <motion.button onViewportEnter={onLoadMore}>
              {isLoadingMore ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Loading...
                </>
              ) : !canLoadMore ? (
                "No more customers"
              ) : (
                "Load More"
              )}
            </motion.button>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CustomersListPage;
