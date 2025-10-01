"use client";

import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useMutation } from "convex/react";
import {
  ChevronDownIcon,
  Loader2Icon,
  PlusIcon,
  UploadIcon,
  UserPlusIcon,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { toast } from "sonner";
import { CustomerForm, CustomerFormProps } from "../_components/customer-form";
import { CustomerTableRow } from "./_components/customer-table-row";

const ITEMS_PER_PAGE = 50;

const CustomersListPage = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.domains.customers.queries.getCustomersListPaginated,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );

  const isLoadingMore = status === "LoadingMore";
  const canLoadMore = status === "CanLoadMore";
  const isLoadingFirstPage = status === "LoadingFirstPage";

  const onLoadMore = () => {
    if (canLoadMore) {
      loadMore(ITEMS_PER_PAGE / 2);
    }
  };

  const [openCreateDialog, setOpenCreateDialog] = React.useState(false);
  const [isLoading, startLoading] = React.useTransition();
  const createCustomer = useMutation(
    api.domains.customers.mutations.createCustomer,
  );
  const onCreateCustomer: CustomerFormProps["onSubmit"] = async (data) => {
    startLoading(async () => {
      await toast
        .promise(createCustomer(data), {
          loading: "Creating customer...",
          success: "Customer created successfully",
          error: "Failed to create customer",
        })
        .unwrap();

      setOpenCreateDialog(false);
    });
  };

  return (
    <div className="container flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Customers</h1>

        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="group">
                <PlusIcon />
                Add Customer
                <ChevronDownIcon className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DialogTrigger asChild>
                <DropdownMenuItem>
                  <UserPlusIcon /> Single Customer
                </DropdownMenuItem>
              </DialogTrigger>

              <DropdownMenuItem asChild>
                <Link href="/customers/import">
                  <UploadIcon /> Import Bulk
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Single Customer</DialogTitle>
              <DialogDescription>
                Add a single customer to the database.
              </DialogDescription>
            </DialogHeader>

            <CustomerForm onSubmit={onCreateCustomer}>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2Icon className="animate-spin" />}
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </CustomerForm>
          </DialogContent>
        </Dialog>
      </header>

      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Problem Type</TableHead>
              <TableHead className="w-1">{/* actions */}</TableHead>
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
                <CustomerTableRow key={customer._id} customer={customer} />
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

const TableSkeletonRow = () => (
  <TableRow>
    <TableCell className="w-1">
      <Skeleton className="h-4 w-4" />
    </TableCell>
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
    <TableCell className="w-1">
      <Skeleton className="h-4 w-4" />
    </TableCell>
  </TableRow>
);

export default CustomersListPage;
